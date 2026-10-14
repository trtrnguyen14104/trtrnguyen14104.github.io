import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { MongoServerError, ObjectId, type Db } from "mongodb";
import type { ContactMessage, ContactStatus, NotificationStatus } from "@/types/cms";
import type { ContactInput } from "./schemas";
import { CmsError } from "./errors";
import { getDb } from "./database";
import { limitContact } from "./rate-limit";
import { sendNotification } from "./mail";
import { notificationErrorDetails } from "./notification-errors";

export interface ContactDocument {
  _id: ObjectId; submissionId: string; payloadHash: string;
  name: string; email: string; subject: string; message: string;
  status: ContactStatus; createdAt: Date; updatedAt: Date;
  notification: { status: NotificationStatus; attempts: number; attemptedAt?: Date; sentAt?: Date; lease?: string };
}
function objectId(id: string) {
  if (!/^[a-fA-F0-9]{24}$/.test(id)) throw new CmsError(400, "INVALID_ID", "ID tin nhắn không hợp lệ.");
  return new ObjectId(id);
}
export function serializeContact(doc: ContactDocument): ContactMessage {
  return {
    id: doc._id.toHexString(), name: doc.name, email: doc.email, subject: doc.subject, message: doc.message,
    status: doc.status, createdAt: doc.createdAt.toISOString(), updatedAt: doc.updatedAt.toISOString(),
    notification: { status: doc.notification.status, attempts: doc.notification.attempts,
      attemptedAt: doc.notification.attemptedAt?.toISOString(), sentAt: doc.notification.sentAt?.toISOString() },
  };
}
export async function notifyContact(id: string, db?: Db, sender = sendNotification) {
  const collection = (db ?? await getDb()).collection<ContactDocument>("contacts");
  const lease = randomUUID(); const now = new Date();
  const doc = await collection.findOneAndUpdate({
    _id: objectId(id), $or: [
      { "notification.status": { $in: ["pending", "failed"] } },
      { "notification.status": "sending", "notification.attemptedAt": { $lt: new Date(now.getTime() - 120000) } },
    ],
  }, {
    $set: { "notification.status": "sending", "notification.attemptedAt": now, "notification.lease": lease },
    $inc: { "notification.attempts": 1 },
  }, { returnDocument: "after" });
  if (!doc) {
    const current = await collection.findOne({ _id: objectId(id) });
    if (!current) throw new CmsError(404, "NOT_FOUND", "Không tìm thấy tin nhắn.");
    throw new CmsError(409, "NOTIFICATION_UNAVAILABLE", current.notification.status === "sent" ? "Thông báo đã gửi thành công." : "Thông báo đang được gửi. Hãy thử lại sau.");
  }
  let status: "sent" | "failed" = "sent";
  try { await sender(doc); }
  catch (error) {
    status = "failed";
    console.error("cms.notification_failed", { id, ...notificationErrorDetails(error) });
  }
  await collection.updateOne({ _id: doc._id, "notification.lease": lease }, {
    $set: { "notification.status": status, ...(status === "sent" ? { "notification.sentAt": new Date() } : {}) },
    $unset: { "notification.lease": "" },
  });
  return { status };
}
export async function submitContact(input: ContactInput, request: Request, db?: Db, notifier = notifyContact) {
  if (input.website) throw new CmsError(400, "SPAM_REJECTED", "Không thể tiếp nhận yêu cầu.");
  const database = db ?? await getDb();
  await limitContact(request, database);
  const collection = database.collection<ContactDocument>("contacts");
  const payloadHash = createHash("sha256").update(JSON.stringify([input.name, input.email, input.subject, input.message])).digest("hex");
  const existing = await collection.findOne({ submissionId: input.submissionId });
  const reuse = (doc: ContactDocument) => {
    if (doc.payloadHash !== payloadHash) throw new CmsError(409, "SUBMISSION_CONFLICT", "Mã gửi đã được dùng cho nội dung khác.");
    return { id: doc._id.toHexString(), received: true };
  };
  if (existing) return reuse(existing);
  const now = new Date();
  const doc: ContactDocument = {
    _id: new ObjectId(), submissionId: input.submissionId, payloadHash,
    name: input.name, email: input.email, subject: input.subject, message: input.message,
    status: "new", createdAt: now, updatedAt: now, notification: { status: "pending", attempts: 0 },
  };
  try { await collection.insertOne(doc); }
  catch (error) {
    if (!(error instanceof MongoServerError && error.code === 11000)) throw error;
    const duplicate = await collection.findOne({ submissionId: input.submissionId });
    if (!duplicate) throw error;
    return reuse(duplicate);
  }
  try { await notifier(doc._id.toHexString(), database); }
  catch (error) {
    // A stored message remains accepted even if SMTP or its status write fails.
    console.error("cms.notification_interrupted", { id: doc._id.toHexString(), type: error instanceof Error ? error.name : "UnknownError" });
  }
  return { id: doc._id.toHexString(), received: true };
}
export async function listContacts(query: { status?: ContactStatus; page: number; limit: number }) {
  const collection = (await getDb()).collection<ContactDocument>("contacts");
  const filter = query.status ? { status: query.status } : {};
  const [docs, total] = await Promise.all([
    collection.find(filter).sort({ createdAt: -1, _id: -1 }).skip((query.page - 1) * query.limit).limit(query.limit).toArray(),
    collection.countDocuments(filter),
  ]);
  return { items: docs.map(serializeContact), total, page: query.page, limit: query.limit };
}
export async function readContact(id: string) {
  const doc = await (await getDb()).collection<ContactDocument>("contacts").findOne({ _id: objectId(id) });
  if (!doc) throw new CmsError(404, "NOT_FOUND", "Không tìm thấy tin nhắn.");
  return serializeContact(doc);
}
export async function changeContactStatus(id: string, status: ContactStatus) {
  const doc = await (await getDb()).collection<ContactDocument>("contacts").findOneAndUpdate(
    { _id: objectId(id) }, { $set: { status, updatedAt: new Date() } }, { returnDocument: "after" },
  );
  if (!doc) throw new CmsError(404, "NOT_FOUND", "Không tìm thấy tin nhắn.");
  return serializeContact(doc);
}
export async function deleteContact(id: string) {
  const result = await (await getDb()).collection<ContactDocument>("contacts").deleteOne({ _id: objectId(id) });
  if (!result.deletedCount) throw new CmsError(404, "NOT_FOUND", "Không tìm thấy tin nhắn.");
  return { deleted: true };
}
