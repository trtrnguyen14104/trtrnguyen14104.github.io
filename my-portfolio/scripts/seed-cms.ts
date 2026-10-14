import { loadEnvConfig } from "@next/env";
import { MongoClient } from "mongodb";
import { portfolioData } from "../data/portfolioData";
import { seedCms } from "../lib/cms/seed";

async function main() {
  loadEnvConfig(process.cwd());
  const uri = process.env.MONGODB_URI;
  const database = process.env.MONGODB_DB;
  if (!uri || !database) {
    console.error("Configure MONGODB_URI and MONGODB_DB in .env.local before seeding.");
    process.exitCode = 1;
    return;
  }
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const result = await seedCms(client.db(database), portfolioData);
    console.log(result.upsertedCount ? "CMS initialized from portfolioData." : "CMS already initialized; existing content preserved.");
  } finally { await client.close(); }
}
main().catch((error) => {
  console.error("CMS seed failed", { type: error instanceof Error ? error.name : "UnknownError" });
  process.exitCode = 1;
});
