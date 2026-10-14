import { listContacts } from "@/lib/cms/contacts";
import { endpoint, requireAdmin, success } from "@/lib/cms/http";
import { contactQuerySchema } from "@/lib/cms/schemas";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  return endpoint(async () => {
    await requireAdmin();
    const query = contactQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return success(await listContacts(query));
  });
}
