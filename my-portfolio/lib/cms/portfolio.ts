import "server-only";
import { cache } from "react";
import type { Db } from "mongodb";
import type { PortfolioData } from "@/types/portfolio";
import type { PortfolioSnapshot } from "@/types/cms";
import { getDb } from "./database";
import { CmsError } from "./errors";
import { sectionSchemas, type SectionName } from "./schemas";

export interface PortfolioDocument {
  _id: string; portfolio: PortfolioData; version: number; updatedAt: Date; updatedBy: string;
}
function serialize(doc: PortfolioDocument): PortfolioSnapshot {
  return { portfolio: doc.portfolio, version: doc.version, updatedAt: doc.updatedAt.toISOString(), updatedBy: doc.updatedBy };
}
export async function readPortfolio(db?: Db): Promise<PortfolioSnapshot> {
  const doc = await (db ?? await getDb()).collection<PortfolioDocument>("portfolio").findOne({ _id: "main" });
  if (!doc) throw new CmsError(503, "NOT_INITIALIZED", "Portfolio chưa được khởi tạo. Hãy chạy lệnh seed.");
  return serialize(doc);
}
// React cache deduplicates only within a server render, never across requests.
export const readPublicPortfolio = cache(async () => (await readPortfolio()).portfolio);

export async function updatePortfolio(section: SectionName, value: unknown, version: number, actor: string, db?: Db) {
  const validated = sectionSchemas[section].parse(value);
  const collection = (db ?? await getDb()).collection<PortfolioDocument>("portfolio");
  const doc = await collection.findOneAndUpdate(
    { _id: "main", version },
    { $set: { [`portfolio.${section}`]: validated, updatedAt: new Date(), updatedBy: actor }, $inc: { version: 1 } },
    { returnDocument: "after" },
  );
  if (!doc) throw new CmsError(409, "VERSION_CONFLICT", "Dữ liệu đã thay đổi. Tải lại dữ liệu trước khi lưu.");
  return serialize(doc);
}
