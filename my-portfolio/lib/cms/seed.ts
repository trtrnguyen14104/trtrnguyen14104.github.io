import "server-only";
import type { Db } from "mongodb";
import type { PortfolioData } from "@/types/portfolio";
import type { PortfolioDocument } from "./portfolio";
import { portfolioSchema } from "./schemas";
import { getAdminEmail } from "./owner";

export async function seedCms(db: Db, data: PortfolioData) {
  const adminEmail = getAdminEmail();
  const portfolio = portfolioSchema.parse(data);
  await db.collection("contacts").createIndexes([
    { key: { submissionId: 1 }, unique: true, name: "unique_submission" },
    { key: { status: 1, createdAt: -1, _id: -1 }, name: "status_inbox" },
    { key: { createdAt: -1, _id: -1 }, name: "inbox" },
  ]);
  await db.collection("rateLimits").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  return db.collection<PortfolioDocument>("portfolio").updateOne(
    { _id: "main" },
    { $setOnInsert: { portfolio, version: 1, updatedAt: new Date(), updatedBy: adminEmail } },
    { upsert: true },
  );
}
