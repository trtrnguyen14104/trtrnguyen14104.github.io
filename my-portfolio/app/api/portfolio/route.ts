import { readPublicPortfolio } from "@/lib/cms/portfolio";
import { endpoint, success } from "@/lib/cms/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() { return endpoint(async () => success(await readPublicPortfolio())); }
