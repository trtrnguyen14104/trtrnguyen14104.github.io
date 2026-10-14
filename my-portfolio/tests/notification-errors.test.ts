// @vitest-environment node
import { describe, expect, it } from "vitest";
import { notificationErrorDetails } from "@/lib/cms/notification-errors";

describe("safe notification diagnostics", () => {
  it("exposes authentication error codes without credentials or raw SMTP response", () => {
    const error = Object.assign(new Error("password=secret"), {
      code: "EAUTH", responseCode: 535, command: "AUTH PLAIN",
      response: "535 secret-token visitor@example.com", auth: { pass: "secret" },
    });
    const details = notificationErrorDetails(error);
    expect(details).toEqual({ type: "Error", smtpCode: "EAUTH", smtpResponseCode: 535, smtpCommand: "AUTH PLAIN" });
    expect(JSON.stringify(details)).not.toContain("secret");
    expect(JSON.stringify(details)).not.toContain("visitor@example.com");
  });
  it("rejects unrecognized or credential-bearing properties", () => {
    expect(notificationErrorDetails({ code: "secret-token", responseCode: 999, command: "AUTH PLAIN secret-token" })).toEqual({ type: "UnknownError" });
    expect(notificationErrorDetails("secret-token")).toEqual({ type: "UnknownError" });
  });
  it("preserves recognized connection error diagnostics", () => {
    expect(notificationErrorDetails(Object.assign(new Error("Sensitive hostname"), { code: "ETIMEDOUT", command: "CONN" }))).toEqual({ type: "Error", smtpCode: "ETIMEDOUT", smtpCommand: "CONN" });
  });
});
