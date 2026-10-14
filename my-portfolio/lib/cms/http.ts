import "server-only";
import { z } from "zod";
import { auth } from "@/auth";
import { isAdminSession } from "./identity";
import { appOrigin } from "./config";
import { getAdminEmail } from "./owner";
import { CmsError } from "./errors";

export const privateHeaders = { "Cache-Control": "no-store" };
export function success(data: unknown, status = 200) { return Response.json({ data }, { status, headers: privateHeaders }); }
export async function endpoint(work: () => Promise<Response>) {
  try { return await work(); }
  catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: { code: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ.", fields: z.flattenError(error).fieldErrors } }, { status: 400, headers: privateHeaders });
    if (error instanceof CmsError) return Response.json({ error: { code: error.code, message: error.message } }, { status: error.status, headers: privateHeaders });
    // Avoid logging raw database/SMTP errors, which may contain credentials or PII.
    console.error("cms.request_failed", { type: error instanceof Error ? error.name : "UnknownError" });
    return Response.json({ error: { code: "SERVICE_UNAVAILABLE", message: "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại." } }, { status: 503, headers: privateHeaders });
  }
}
export function assertOrigin(request: Request) {
  if (request.headers.get("origin") !== appOrigin()) throw new CmsError(403, "ORIGIN_REJECTED", "Nguồn yêu cầu không được phép.");
}
export async function requireAdmin(request?: Request) {
  const session = await auth();
  if (!session) throw new CmsError(401, "UNAUTHENTICATED", "Vui lòng đăng nhập.");
  if (!isAdminSession(session)) throw new CmsError(403, "FORBIDDEN", "Tài khoản không có quyền quản trị.");
  if (request && !["GET", "HEAD"].includes(request.method)) assertOrigin(request);
  return getAdminEmail();
}
export async function boundedBody(request: Request, maxBytes: number): Promise<Uint8Array> {
  const length = request.headers.get("content-length");
  if (length && Number(length) > maxBytes) throw new CmsError(413, "BODY_TOO_LARGE", "Nội dung gửi vượt giới hạn.");
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = []; let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      total += value.byteLength;
      if (total > maxBytes) { await reader.cancel(); throw new CmsError(413, "BODY_TOO_LARGE", "Nội dung gửi vượt giới hạn."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const output = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.byteLength; }
  return output;
}
export async function jsonBody(request: Request, maxBytes = 256 * 1024): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new CmsError(415, "CONTENT_TYPE", "Cần nội dung JSON.");
  const bytes = await boundedBody(request, maxBytes);
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { throw new CmsError(400, "INVALID_JSON", "Nội dung JSON không hợp lệ."); }
}
