import { boundedBody, endpoint, requireAdmin, success } from "@/lib/cms/http";
import { MAX_IMAGE_BYTES, uploadImage } from "@/lib/cms/media";
import { CmsError } from "@/lib/cms/errors";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  return endpoint(async () => {
    const actor = await requireAdmin(request);
    const contentType = request.headers.get("content-type");
    if (!contentType?.startsWith("multipart/form-data;")) throw new CmsError(415, "CONTENT_TYPE", "Cần gửi ảnh bằng multipart/form-data.");
    const bytes = await boundedBody(request, MAX_IMAGE_BYTES + 64 * 1024);
    let form: FormData;
    try { form = await new Response(Buffer.from(bytes), { headers: { "Content-Type": contentType } }).formData(); }
    catch { throw new CmsError(400, "INVALID_FORM", "Dữ liệu upload không hợp lệ."); }
    const file = form.get("file");
    if (!(file instanceof File) || [...form.keys()].length !== 1) throw new CmsError(400, "IMAGE_REQUIRED", "Cần chọn một ảnh.");
    return success(await uploadImage(new Uint8Array(await file.arrayBuffer()), actor), 201);
  });
}
