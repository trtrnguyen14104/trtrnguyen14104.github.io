const smtpCodes = new Set(["EAUTH", "ECONNECTION", "ETIMEDOUT", "ESOCKET", "EDNS", "ETLS", "EENVELOPE", "EMESSAGE"]);
const smtpCommands = new Set(["CONN", "EHLO", "HELO", "STARTTLS", "AUTH PLAIN", "AUTH LOGIN", "AUTH XOAUTH2", "MAIL FROM", "RCPT TO", "DATA"]);

export function notificationErrorDetails(error: unknown) {
  const details: { type: string; smtpCode?: string; smtpResponseCode?: number; smtpCommand?: string } = {
    type: error instanceof Error ? error.name : "UnknownError",
  };
  if (!error || typeof error !== "object") return details;
  const smtpError = error as { code?: unknown; responseCode?: unknown; command?: unknown };
  // Never include error.message, response, stack, auth data, or arbitrary property values.
  if (typeof smtpError.code === "string" && smtpCodes.has(smtpError.code)) details.smtpCode = smtpError.code;
  if (typeof smtpError.responseCode === "number" && Number.isInteger(smtpError.responseCode)
    && smtpError.responseCode >= 100 && smtpError.responseCode <= 599) details.smtpResponseCode = smtpError.responseCode;
  if (typeof smtpError.command === "string" && smtpCommands.has(smtpError.command)) details.smtpCommand = smtpError.command;
  return details;
}
