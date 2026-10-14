import "server-only";
import { createHmac } from "node:crypto";
import { MongoServerError, type Db } from "mongodb";
import { requiredSecret } from "./config";
import { CmsError } from "./errors";

interface Counter { _id: string; count: number; expiresAt: Date }
export async function limitContact(request: Request, db: Db, now = Date.now()) {
  // Vercel overwrites x-vercel-forwarded-for. Do not trust arbitrary X-Forwarded-For.
  const ip = process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() : "local-development";
  if (!ip) throw new CmsError(503, "CLIENT_ADDRESS_UNAVAILABLE", "Không thể xác định nguồn gửi.");
  const hash = createHmac("sha256", requiredSecret("RATE_LIMIT_SECRET")).update(ip).digest("hex");
  const window = 15 * 60 * 1000;
  const bucket = Math.floor(now / window);
  const collection = db.collection<Counter>("rateLimits");
  const increment = () => collection.findOneAndUpdate(
    { _id: `${hash}:${bucket}` },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 2) * window) } },
    { upsert: true, returnDocument: "after" },
  );
  let doc;
  try { doc = await increment(); }
  catch (error) {
    if (!(error instanceof MongoServerError && error.code === 11000)) throw error;
    doc = await increment();
  }
  if (!doc || doc.count > 5) throw new CmsError(429, "RATE_LIMITED", "Bạn đã gửi quá nhiều lần. Vui lòng thử lại sau 15 phút.");
}
