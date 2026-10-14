import { getAdminEmail } from "./owner";

export function isOwner(email: unknown): boolean {
  return typeof email === "string" && email.trim().toLowerCase() === getAdminEmail();
}
export function canSignIn(account: { provider?: string } | null | undefined, profile: { email?: unknown; email_verified?: unknown } | undefined): boolean {
  return account?.provider === "google" && profile?.email_verified === true && isOwner(profile.email);
}
export function isAdminSession(session: { user?: { email?: string | null; ownerVerified?: boolean }; expires?: string } | null): boolean {
  return !!session?.user?.ownerVerified && isOwner(session.user.email)
    && typeof session.expires === "string" && Date.parse(session.expires) > Date.now();
}
