// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), list: vi.fn(), read: vi.fn(), change: vi.fn(), remove: vi.fn(), notify: vi.fn(), submit: vi.fn(), upload: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/cms/contacts", () => ({ listContacts: mocks.list, readContact: mocks.read, changeContactStatus: mocks.change, deleteContact: mocks.remove, notifyContact: mocks.notify, submitContact: mocks.submit }));
vi.mock("@/lib/cms/media", () => ({ uploadImage: mocks.upload, MAX_IMAGE_BYTES: 3 * 1024 * 1024 }));
import { GET as list } from "@/app/api/admin/contacts/route";
import { GET as read, PATCH as change, DELETE as remove } from "@/app/api/admin/contacts/[id]/route";
import { POST as notify } from "@/app/api/admin/contacts/[id]/notify/route";
import { POST as upload } from "@/app/api/admin/media/route";
import { POST as submit } from "@/app/api/contact/route";
const context = { params: Promise.resolve({ id: "a".repeat(24) }) };
const request = (path: string, method = "GET", body?: unknown) => new Request(`http://localhost:3000/api/${path}`, { method, headers: { Origin: "http://localhost:3000", "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
beforeEach(() => {
  vi.clearAllMocks(); vi.stubEnv("APP_URL", "http://localhost:3000");
  vi.stubEnv("ADMIN_EMAIL", "trtrnguyen14104@gmail.com");
  mocks.auth.mockResolvedValue({ user: { email: "trtrnguyen14104@gmail.com", ownerVerified: true }, expires: new Date(Date.now() + 10000).toISOString() });
});
describe("contact and media route contracts", () => {
  it("guards every private contact and media endpoint", async () => {
    mocks.auth.mockResolvedValue(null);
    const responses = await Promise.all([
      list(request("admin/contacts")), read(request("admin/contacts/a"), context),
      change(request("admin/contacts/a", "PATCH", { status: "read" }), context),
      remove(request("admin/contacts/a", "DELETE"), context), notify(request("admin/contacts/a/notify", "POST"), context),
      upload(request("admin/media", "POST")),
    ]);
    for (const response of responses) expect(response.status).toBe(401);
    for (const service of [mocks.list, mocks.read, mocks.change, mocks.remove, mocks.notify, mocks.upload]) expect(service).not.toHaveBeenCalled();
  });
  it("validates pagination and status filters", async () => {
    expect((await list(request("admin/contacts?limit=1000"))).status).toBe(400);
    expect((await list(request("admin/contacts?status=invalid"))).status).toBe(400);
    mocks.list.mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 });
    expect((await list(request("admin/contacts?status=archived"))).status).toBe(200);
    expect(mocks.list).toHaveBeenCalledWith({ page: 1, limit: 20, status: "archived" });
  });
  it("validates contact state mutations before calling persistence", async () => {
    expect((await change(request("admin/contacts/a", "PATCH", { status: "invalid" }), context)).status).toBe(400);
    expect(mocks.change).not.toHaveBeenCalled();
  });
  it("accepts a valid public contact independently of an admin session", async () => {
    mocks.auth.mockResolvedValue(null); mocks.submit.mockResolvedValue({ id: "a".repeat(24), received: true });
    const body = { submissionId: crypto.randomUUID(), name: "Visitor", email: "visitor@example.com", subject: "Hello", message: "A message" };
    const response = await submit(request("contact", "POST", body));
    expect(response.status).toBe(201); expect(await response.json()).toEqual({ data: { id: "a".repeat(24), received: true } });
    expect(mocks.auth).not.toHaveBeenCalled();
  });
  it("bounds public submissions and rejects invalid identities", async () => {
    expect((await submit(request("contact", "POST", { name: "" }))).status).toBe(400);
    expect((await submit(request("contact", "POST", { message: "x".repeat(33 * 1024) }))).status).toBe(413);
    expect(mocks.submit).not.toHaveBeenCalled();
  });
  it("parses a multipart image and returns the uploaded asset", async () => {
    const form = new FormData(); form.set("file", new File(["signature"], "test.png", { type: "image/png" }));
    mocks.upload.mockResolvedValue({ url: "https://res.cloudinary.com/test/image.png", publicId: "test/image" });
    const response = await upload(new Request("http://localhost:3000/api/admin/media", { method: "POST", headers: { Origin: "http://localhost:3000" }, body: form }));
    expect(response.status).toBe(201); expect(mocks.upload).toHaveBeenCalledWith(expect.any(Uint8Array), "trtrnguyen14104@gmail.com");
  });
  it("rejects missing files and maps Cloudinary failures to safe errors", async () => {
    expect((await upload(request("admin/media", "POST", {}))).status).toBe(415);
    const form = new FormData(); form.set("file", "not-a-file");
    expect((await upload(new Request("http://localhost:3000/api/admin/media", { method: "POST", headers: { Origin: "http://localhost:3000" }, body: form }))).status).toBe(400);
    const image = new FormData(); image.set("file", new File(["signature"], "test.png"));
    mocks.upload.mockRejectedValue(new Error("secret-cloudinary-credentials"));
    const failure = await upload(new Request("http://localhost:3000/api/admin/media", { method: "POST", headers: { Origin: "http://localhost:3000" }, body: image }));
    expect(failure.status).toBe(503); expect(await failure.text()).not.toContain("secret-cloudinary");
  });
});
