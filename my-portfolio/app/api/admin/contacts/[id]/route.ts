import { readContact, changeContactStatus, deleteContact } from "@/lib/cms/contacts";
import { endpoint, jsonBody, requireAdmin, success } from "@/lib/cms/http";
import { contactPatchSchema } from "@/lib/cms/schemas";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  return endpoint(async () => { await requireAdmin(); return success(await readContact((await context.params).id)); });
}
export async function PATCH(request: Request, context: Context) {
  return endpoint(async () => {
    await requireAdmin(request);
    const { status } = contactPatchSchema.parse(await jsonBody(request, 1024));
    return success(await changeContactStatus((await context.params).id, status));
  });
}
export async function DELETE(request: Request, context: Context) {
  return endpoint(async () => { await requireAdmin(request); return success(await deleteContact((await context.params).id)); });
}
