// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { configuredAdminEmail, getAdminEmail } from "@/lib/cms/owner";
import { canSignIn, isAdminSession } from "@/lib/cms/identity";
import { authConfigured } from "@/lib/cms/config";

vi.mock("server-only", () => ({}));
afterEach(() => vi.unstubAllEnvs());
describe("environment-based owner identity", () => {
  it("reads configuration lazily and normalizes whitespace and case", () => {
    vi.stubEnv("ADMIN_EMAIL", " First.Owner@Gmail.com ");
    expect(getAdminEmail()).toBe("first.owner@gmail.com");
    vi.stubEnv("ADMIN_EMAIL", "second.owner@gmail.com");
    expect(getAdminEmail()).toBe("second.owner@gmail.com");
  });
  it("fails closed on missing and malformed email configuration", () => {
    for (const value of [undefined, "", "not-an-email", "owner@gmail.com\r\nBcc: attacker@gmail.com"]) {
      vi.stubEnv("ADMIN_EMAIL", value);
      expect(configuredAdminEmail()).toBeNull();
      expect(() => getAdminEmail()).toThrow("Configure ADMIN_EMAIL");
    }
  });
  it("accepts only the configured Google owner and rejects the previous owner's session", () => {
    vi.stubEnv("ADMIN_EMAIL", "new.owner@gmail.com");
    expect(canSignIn({ provider: "google" }, { email: "new.owner@gmail.com", email_verified: true })).toBe(true);
    expect(canSignIn({ provider: "google" }, { email: "trtrnguyen14104@gmail.com", email_verified: true })).toBe(false);
    expect(canSignIn({ provider: "google" }, { email: "new.owner@gmail.com", email_verified: false })).toBe(false);
    expect(isAdminSession({ user: { email: "trtrnguyen14104@gmail.com", ownerVerified: true }, expires: new Date(Date.now() + 60000).toISOString() })).toBe(false);
  });
  it("disables login when the owner email is missing or invalid", () => {
    for (const key of ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET", "APP_URL"]) vi.stubEnv(key, "configured");
    vi.stubEnv("AUTH_SECRET", "a".repeat(32));
    vi.stubEnv("ADMIN_EMAIL", ""); expect(authConfigured()).toBe(false);
    vi.stubEnv("ADMIN_EMAIL", "invalid"); expect(authConfigured()).toBe(false);
    vi.stubEnv("ADMIN_EMAIL", "owner@gmail.com"); expect(authConfigured()).toBe(true);
  });
});
