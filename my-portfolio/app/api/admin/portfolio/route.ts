import { readPortfolio, updatePortfolio } from "@/lib/cms/portfolio";
import { endpoint, jsonBody, requireAdmin, success } from "@/lib/cms/http";
import { portfolioPatchSchema } from "@/lib/cms/schemas";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() { return endpoint(async () => { await requireAdmin(); return success(await readPortfolio()); }); }
export async function PATCH(request: Request) {
  return endpoint(async () => {
    const actor = await requireAdmin(request);
    const { section, value, version } = portfolioPatchSchema.parse(await jsonBody(request));
    return success(await updatePortfolio(section, value, version, actor));
  });
}
