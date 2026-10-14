// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ObjectId, type Db } from "mongodb";
import { portfolioData } from "@/data/portfolioData";
import { canSignIn, isAdminSession } from "@/lib/cms/identity";
import { contactSchema, portfolioSchema, sectionSchemas } from "@/lib/cms/schemas";
import { seedCms } from "@/lib/cms/seed";
import { readPortfolio, updatePortfolio, type PortfolioDocument } from "@/lib/cms/portfolio";
import { limitContact } from "@/lib/cms/rate-limit";
import { notifyContact, submitContact, type ContactDocument } from "@/lib/cms/contacts";
import { validateImage, MAX_IMAGE_BYTES } from "@/lib/cms/media";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/cms/database", () => ({ getDb: vi.fn() }));
vi.mock("@/lib/cms/mail", () => ({ sendNotification: vi.fn() }));
const owner = "trtrnguyen14104@gmail.com";
const request = () => new Request("http://localhost:3000/api/contact", { method: "POST" });
const input = () => contactSchema.parse({ submissionId: crypto.randomUUID(), name: "Visitor", email: "visitor@example.com", subject: "Hello", message: "An opportunity" });
function asDb(collections: Record<string, unknown>) { return { collection: (name: string) => collections[name] } as unknown as Db; }
function counter() {
  let count = 0;
  return { findOneAndUpdate: vi.fn(async () => ({ count: ++count })) };
}
beforeEach(() => { vi.stubEnv("ADMIN_EMAIL", owner); vi.stubEnv("RATE_LIMIT_SECRET", "test-secret-at-least-thirty-two-characters"); vi.stubEnv("VERCEL", ""); });

describe("owner authentication", () => {
  it("accepts only the verified Google owner", () => {
    expect(canSignIn({ provider: "google" }, { email: owner, email_verified: true })).toBe(true);
    for (const profile of [{ email: "other@gmail.com", email_verified: true }, { email: owner, email_verified: false }, { email: owner, email_verified: "true" }]) expect(canSignIn({ provider: "google" }, profile)).toBe(false);
    expect(canSignIn({ provider: "credentials" }, { email: owner, email_verified: true })).toBe(false);
    expect(canSignIn(undefined, undefined)).toBe(false);
    expect(canSignIn({ provider: "google" }, { email: "trtrnguyen14104+admin@gmail.com", email_verified: true })).toBe(false);
  });
  it("rejects expired, unverified and non-owner sessions", () => {
    const valid = { user: { email: owner, ownerVerified: true }, expires: new Date(Date.now() + 10000).toISOString() };
    expect(isAdminSession(valid)).toBe(true);
    expect(isAdminSession({ ...valid, expires: new Date(0).toISOString() })).toBe(false);
    expect(isAdminSession({ ...valid, user: { email: owner, ownerVerified: false } })).toBe(false);
    expect(isAdminSession({ ...valid, user: { email: "other@gmail.com", ownerVerified: true } })).toBe(false);
    expect(isAdminSession(null)).toBe(false);
  });
});
describe("input validation", () => {
  it("accepts current portfolio data and empty collections", () => {
    expect(portfolioSchema.parse(portfolioData)).toEqual(portfolioData);
    expect(sectionSchemas.projects.parse([])).toEqual([]);
  });
  it("rejects duplicate IDs, unsafe links, invalid levels and colors", () => {
    expect(sectionSchemas.projects.safeParse([portfolioData.projects[0], portfolioData.projects[0]]).success).toBe(false);
    expect(sectionSchemas.profile.safeParse({ ...portfolioData.profile, github: "javascript:alert(1)" }).success).toBe(false);
    expect(sectionSchemas.skills.safeParse([{ name: "Go", category: "Language", level: 101 }]).success).toBe(false);
    expect(sectionSchemas.projects.safeParse([{ ...portfolioData.projects[0], bgColor: "red" }]).success).toBe(false);
  });
  it("requires sender identity and bounds contact fields", () => {
    const data = input();
    for (const patch of [{ name: "" }, { email: "not-email" }, { message: "x".repeat(5001) }, { subject: "Header\r\nInjection" }, { submissionId: "invalid" }, { status: "read" }]) expect(contactSchema.safeParse({ ...data, ...patch }).success).toBe(false);
  });
});
describe("portfolio persistence", () => {
  it("seeds only once and preserves edited content on subsequent runs", async () => {
    let stored: PortfolioDocument | undefined;
    const portfolio = { updateOne: vi.fn(async (_filter, update) => { if (!stored) stored = { _id: "main", ...update.$setOnInsert }; return { upsertedCount: 1 }; }) };
    const db = asDb({ portfolio, contacts: { createIndexes: vi.fn() }, rateLimits: { createIndex: vi.fn() } });
    await seedCms(db, portfolioData);
    stored!.portfolio = { ...stored!.portfolio, profile: { ...stored!.portfolio.profile, name: "Edited owner" } };
    await seedCms(db, portfolioData);
    expect(stored!.portfolio.profile.name).toBe("Edited owner");
  });
  it("applies one update and rejects a stale concurrent save", async () => {
    let doc: PortfolioDocument = { _id: "main", portfolio: structuredClone(portfolioData), version: 1, updatedAt: new Date(), updatedBy: owner };
    const collection = { findOneAndUpdate: vi.fn(async (filter, update) => {
      if (filter.version !== doc.version) return null;
      doc = { ...doc, version: doc.version + 1, updatedAt: update.$set.updatedAt, updatedBy: update.$set.updatedBy,
        portfolio: { ...doc.portfolio, profile: update.$set["portfolio.profile"] } };
      return doc;
    }) };
    const db = asDb({ portfolio: collection });
    const saves = await Promise.allSettled([
      updatePortfolio("profile", { ...portfolioData.profile, name: "First" }, 1, owner, db),
      updatePortfolio("profile", { ...portfolioData.profile, name: "Second" }, 1, owner, db),
    ]);
    expect(saves.filter((v) => v.status === "fulfilled")).toHaveLength(1);
    expect(doc.version).toBe(2);
    expect(saves.find((v) => v.status === "rejected")).toMatchObject({ reason: { status: 409 } });
  });
  it("reports uninitialized data and propagates database failures", async () => {
    await expect(readPortfolio(asDb({ portfolio: { findOne: async () => null } }))).rejects.toMatchObject({ code: "NOT_INITIALIZED" });
    await expect(readPortfolio(asDb({ portfolio: { findOne: async () => { throw new Error("database unavailable"); } } }))).rejects.toThrow("database unavailable");
  });
});
describe("distributed contact rate limit", () => {
  it("allows five requests and rejects the sixth using an atomic counter", async () => {
    const collection = counter(); const db = asDb({ rateLimits: collection });
    for (let i = 0; i < 5; i++) await limitContact(request(), db, 1000);
    await expect(limitContact(request(), db, 1000)).rejects.toMatchObject({ status: 429 });
    const [filter, update] = collection.findOneAndUpdate.mock.calls[0] as unknown as [Record<string, string>, { $inc: { count: number } }];
    expect(filter._id).not.toContain("local-development"); expect(update.$inc.count).toBe(1);
  });
  it("requires Vercel's trusted header and does not use spoofed forwarded headers", async () => {
    vi.stubEnv("VERCEL", "1");
    await expect(limitContact(new Request("https://example.com", { headers: { "x-forwarded-for": "1.2.3.4" } }), asDb({ rateLimits: counter() }))).rejects.toMatchObject({ code: "CLIENT_ADDRESS_UNAVAILABLE" });
  });
});
describe("contact submission", () => {
  it("stores before notifying and does not notify a duplicate submission", async () => {
    let stored: ContactDocument | null = null;
    const collection = { findOne: vi.fn(async () => stored), insertOne: vi.fn(async (doc) => { stored = doc; }) };
    const db = asDb({ contacts: collection, rateLimits: counter() });
    const notifier = vi.fn(async () => { expect(stored?.message).toBe("An opportunity"); return { status: "sent" as const }; });
    const data = input();
    const first = await submitContact(data, request(), db, notifier);
    expect(await submitContact(data, request(), db, notifier)).toEqual(first);
    expect(collection.insertOne).toHaveBeenCalledTimes(1); expect(notifier).toHaveBeenCalledTimes(1);
    await expect(submitContact({ ...data, message: "Different" }, request(), db, notifier)).rejects.toMatchObject({ status: 409 });
  });
  it("keeps a saved message accepted when notification is interrupted", async () => {
    const collection = { findOne: async () => null, insertOne: vi.fn() };
    const result = await submitContact(input(), request(), asDb({ contacts: collection, rateLimits: counter() }), async () => { throw new Error("SMTP timeout"); });
    expect(result.received).toBe(true); expect(collection.insertOne).toHaveBeenCalledOnce();
  });
  it("rejects honeypot submissions before storage", async () => {
    const insertOne = vi.fn();
    await expect(submitContact({ ...input(), website: "spam" }, request(), asDb({ contacts: { insertOne } }))).rejects.toMatchObject({ code: "SPAM_REJECTED" });
    expect(insertOne).not.toHaveBeenCalled();
  });
});
describe("notification retry", () => {
  const makeDoc = (): ContactDocument => ({ _id: new ObjectId(), submissionId: crypto.randomUUID(), payloadHash: "test", name: "Visitor", email: "visitor@example.com", subject: "Hello", message: "Opportunity", status: "new", createdAt: new Date(), updatedAt: new Date(), notification: { status: "pending", attempts: 0 } });
  it("records SMTP failure and supports retry without duplicating an in-flight send", async () => {
    const doc = makeDoc();
    const collection = {
      findOneAndUpdate: vi.fn(async (_filter, update) => {
        if (doc.notification.status === "sending" || doc.notification.status === "sent") return null;
        doc.notification = { status: "sending", attempts: doc.notification.attempts + 1, lease: update.$set["notification.lease"] }; return doc;
      }),
      findOne: async () => doc,
      updateOne: vi.fn(async (_filter, update) => { doc.notification.status = update.$set["notification.status"]; }),
    };
    const db = asDb({ contacts: collection });
    expect(await notifyContact(doc._id.toHexString(), db, async () => { throw new Error("SMTP failed"); })).toEqual({ status: "failed" });
    let release!: () => void;
    const sender = vi.fn(() => new Promise<void>((resolve) => { release = resolve; }));
    const retry = notifyContact(doc._id.toHexString(), db, sender);
    await vi.waitFor(() => expect(sender).toHaveBeenCalledOnce());
    await expect(notifyContact(doc._id.toHexString(), db, sender)).rejects.toMatchObject({ status: 409 });
    release(); await retry;
    expect(doc.notification.status).toBe("sent"); expect(doc.notification.attempts).toBe(2);
    await expect(notifyContact(doc._id.toHexString(), db, sender)).rejects.toMatchObject({ status: 409 });
    expect(sender).toHaveBeenCalledOnce();
  });
  it("rejects invalid IDs and missing messages", async () => {
    const db = asDb({ contacts: { findOneAndUpdate: async () => null, findOne: async () => null } });
    await expect(notifyContact("bad", db)).rejects.toMatchObject({ status: 400 });
    await expect(notifyContact(new ObjectId().toHexString(), db)).rejects.toMatchObject({ status: 404 });
  });
});
describe("image validation", () => {
  it("accepts PNG signatures and rejects SVG, truncated and oversized files", async () => {
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64");
    expect((await validateImage(png)).mime).toBe("image/png");
    await expect(validateImage(Buffer.from("<svg></svg>"))).rejects.toMatchObject({ code: "IMAGE_TYPE" });
    await expect(validateImage(png.subarray(0, 9))).rejects.toMatchObject({ code: "IMAGE_TYPE" });
    await expect(validateImage(new Uint8Array(MAX_IMAGE_BYTES + 1))).rejects.toMatchObject({ status: 413 });
  });
});
