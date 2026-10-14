import { notifyContact } from "@/lib/cms/contacts";
import { endpoint, requireAdmin, success } from "@/lib/cms/http";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return endpoint(async () => { await requireAdmin(request); return success(await notifyContact((await context.params).id)); });
}
