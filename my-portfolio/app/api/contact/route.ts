import { submitContact } from "@/lib/cms/contacts";
import { assertOrigin, endpoint, jsonBody, success } from "@/lib/cms/http";
import { contactSchema } from "@/lib/cms/schemas";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  return endpoint(async () => {
    assertOrigin(request);
    const input = contactSchema.parse(await jsonBody(request, 32 * 1024));
    return success(await submitContact(input, request), 201);
  });
}
