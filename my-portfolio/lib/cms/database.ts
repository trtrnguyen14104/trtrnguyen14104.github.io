import "server-only";
import { MongoClient } from "mongodb";
import { requiredEnv } from "./config";

const globalMongo = globalThis as typeof globalThis & { cmsMongo?: Promise<MongoClient> };
export async function getDb() {
  if (!globalMongo.cmsMongo) {
    const client = new MongoClient(requiredEnv("MONGODB_URI"), {
      maxPoolSize: 10, minPoolSize: 0, maxIdleTimeMS: 60000,
      serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000,
      waitQueueTimeoutMS: 5000, socketTimeoutMS: 10000,
    });
    globalMongo.cmsMongo = client.connect().catch(async (error) => {
      globalMongo.cmsMongo = undefined;
      await client.close();
      throw error;
    });
  }
  return (await globalMongo.cmsMongo).db(requiredEnv("MONGODB_DB"));
}
