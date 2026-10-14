// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { uploadImage } from "@/lib/cms/media";
import { sendNotification } from "@/lib/cms/mail";

const mocks = vi.hoisted(() => ({ upload: vi.fn(), insert: vi.fn(), send: vi.fn(), close: vi.fn(), createTransport: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/cms/database", () => ({ getDb: async () => ({ collection: () => ({ insertOne: mocks.insert }) }) }));
vi.mock("cloudinary", () => ({ v2: { config: vi.fn(), uploader: { upload_stream: (_options: unknown, callback: (error: Error | null, result?: unknown) => void) => {
  const stream = { on: () => stream, end: (bytes: unknown) => mocks.upload(bytes, callback) }; return stream;
} } } }));
vi.mock("cms-nodemailer", () => ({ default: { createTransport: mocks.createTransport } }));
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("ADMIN_EMAIL", "trtrnguyen14104@gmail.com");
  mocks.createTransport.mockReturnValue({ sendMail: mocks.send, close: mocks.close });
  for (const key of ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "GMAIL_APP_PASSWORD"]) vi.stubEnv(key, "configured-test-value");
});
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64");
describe("external service boundaries", () => {
  it("stores Cloudinary asset metadata after successful upload", async () => {
    mocks.upload.mockImplementation((_bytes, callback) => callback(null, { secure_url: "https://res.cloudinary.com/demo/avatar.png", public_id: "portfolio-cms/avatar", width: 1, height: 1 }));
    const image = await uploadImage(png, "owner");
    expect(image.publicId).toBe("portfolio-cms/avatar");
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ ...image, createdBy: "owner" }));
  });
  it("propagates Cloudinary failures without storing fake metadata", async () => {
    mocks.upload.mockImplementation((_bytes, callback) => callback(new Error("Cloudinary failed")));
    await expect(uploadImage(png, "owner")).rejects.toThrow("Cloudinary failed");
    expect(mocks.insert).not.toHaveBeenCalled();
  });
  it("uses fixed owner addresses and the visitor as Reply-To, closing SMTP afterwards", async () => {
    await sendNotification({ name: "Visitor", email: "visitor@example.com", subject: "Opportunity", message: "Hello" });
    expect(mocks.send).toHaveBeenCalledWith(expect.objectContaining({ to: "trtrnguyen14104@gmail.com", from: { name: "Portfolio CMS", address: "trtrnguyen14104@gmail.com" }, replyTo: { name: "Visitor", address: "visitor@example.com" }, disableFileAccess: true, disableUrlAccess: true }));
    expect(mocks.close).toHaveBeenCalledOnce();
  });
  it("propagates SMTP failure and still closes transport", async () => {
    mocks.send.mockRejectedValueOnce(new Error("SMTP timeout"));
    await expect(sendNotification({ name: "Visitor", email: "visitor@example.com", subject: "Hello", message: "Test" })).rejects.toThrow("SMTP timeout");
    expect(mocks.close).toHaveBeenCalledOnce();
  });
  it("removes display whitespace from the Gmail App Password", async () => {
    vi.stubEnv("GMAIL_APP_PASSWORD", " abcd efgh ijkl mnop ");
    await sendNotification({ name: "Visitor", email: "visitor@example.com", subject: "Hello", message: "Test" });
    expect(mocks.createTransport).toHaveBeenCalledWith(expect.objectContaining({ auth: { user: "trtrnguyen14104@gmail.com", pass: "abcdefghijklmnop" } }));
  });
  it("uses the configured owner for SMTP authentication and notification addresses", async () => {
    vi.stubEnv("ADMIN_EMAIL", " Other.Owner@Gmail.com ");
    await sendNotification({ name: "Visitor", email: "visitor@example.com", subject: "Hello", message: "Test" });
    expect(mocks.createTransport).toHaveBeenCalledWith(expect.objectContaining({ auth: expect.objectContaining({ user: "other.owner@gmail.com" }) }));
    expect(mocks.send).toHaveBeenCalledWith(expect.objectContaining({ from: { name: "Portfolio CMS", address: "other.owner@gmail.com" }, to: "other.owner@gmail.com", replyTo: { name: "Visitor", address: "visitor@example.com" } }));
  });
  it("rejects missing owner configuration before attempting SMTP", async () => {
    vi.stubEnv("ADMIN_EMAIL", "");
    await expect(sendNotification({ name: "Visitor", email: "visitor@example.com", subject: "Hello", message: "Test" })).rejects.toThrow("Configure ADMIN_EMAIL");
    expect(mocks.createTransport).not.toHaveBeenCalled();
  });
});
