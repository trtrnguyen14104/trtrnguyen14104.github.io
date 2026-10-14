// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), read: vi.fn(), update: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/cms/portfolio", () => ({ readPortfolio: mocks.read, updatePortfolio: mocks.update }));
import { GET, PATCH } from "@/app/api/admin/portfolio/route";
import { endpoint, jsonBody } from "@/lib/cms/http";

beforeEach(() => {
  vi.clearAllMocks(); vi.stubEnv("APP_URL", "http://localhost:3000");
  vi.stubEnv("ADMIN_EMAIL", "trtrnguyen14104@gmail.com");
  mocks.auth.mockResolvedValue({ user: { email: "trtrnguyen14104@gmail.com", ownerVerified: true }, expires: new Date(Date.now() + 10000).toISOString() });
});
const request = (origin = "http://localhost:3000", body = JSON.stringify({ section: "skills", version: 1, value: [] })) => new Request("http://localhost:3000/api/admin/portfolio", { method: "PATCH", headers: { Origin: origin, "Content-Type": "application/json" }, body });
describe("admin API access", () => {
  it("rejects direct unauthenticated access", async () => {
    mocks.auth.mockResolvedValue(null);
    expect((await GET()).status).toBe(401); expect((await PATCH(request())).status).toBe(401);
    expect(mocks.read).not.toHaveBeenCalled(); expect(mocks.update).not.toHaveBeenCalled();
  });
  it("rejects non-owner, expired and unverified sessions", async () => {
    for (const session of [
      { user: { email: "other@gmail.com", ownerVerified: true }, expires: new Date(Date.now() + 10000).toISOString() },
      { user: { email: "trtrnguyen14104@gmail.com", ownerVerified: true }, expires: new Date(0).toISOString() },
      { user: { email: "trtrnguyen14104@gmail.com", ownerVerified: false }, expires: new Date(Date.now() + 10000).toISOString() },
    ]) { mocks.auth.mockResolvedValue(session); expect((await GET()).status).toBe(403); }
    expect(mocks.read).not.toHaveBeenCalled();
  });
  it("rejects missing and foreign origins before modifying data", async () => {
    expect((await PATCH(request("https://attacker.example"))).status).toBe(403);
    expect((await PATCH(request(""))).status).toBe(403);
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("allows an authenticated update and disables response caching", async () => {
    mocks.update.mockResolvedValue({ version: 2 });
    const response = await PATCH(request());
    expect(response.status).toBe(200); expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({ data: { version: 2 } });
    expect(mocks.update).toHaveBeenCalledWith("skills", [], 1, "trtrnguyen14104@gmail.com");
  });
  it("rejects malformed requests and hides internal database errors", async () => {
    expect((await PATCH(request(undefined, "bad json"))).status).toBe(400);
    expect((await PATCH(request(undefined, JSON.stringify({ section: "invalid", version: 0 })))).status).toBe(400);
    mocks.read.mockRejectedValue(new Error("mongodb://password@host"));
    const response = await GET(); expect(response.status).toBe(503); expect(await response.text()).not.toContain("password");
  });
});
describe("bounded request bodies", () => {
  it("enforces byte limits even without Content-Length", async () => {
    const response = await endpoint(async () => { await jsonBody(new Request("http://localhost", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: "x".repeat(100) }) }), 32); return Response.json({}); });
    expect(response.status).toBe(413);
  });
  it("rejects non-JSON content", async () => {
    const response = await endpoint(async () => { await jsonBody(new Request("http://localhost", { method: "POST", body: "plain" })); return Response.json({}); });
    expect(response.status).toBe(415);
  });
});
