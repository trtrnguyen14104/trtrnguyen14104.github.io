import "server-only";
import { z } from "zod";

const adminEmailSchema = z.string().trim().toLowerCase().max(254).email();

// Read lazily so CLI scripts can load .env before accessing server configuration.
// The owner identity remains independent of the editable public profile.
export function configuredAdminEmail(): string | null {
  const result = adminEmailSchema.safeParse(process.env.ADMIN_EMAIL);
  return result.success ? result.data : null;
}

export function getAdminEmail(): string {
  const email = configuredAdminEmail();
  if (!email) throw new Error("Configure ADMIN_EMAIL with a valid email address.");
  return email;
}
