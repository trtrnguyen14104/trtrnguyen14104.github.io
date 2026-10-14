import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session { user: import("next-auth").DefaultSession["user"] & { ownerVerified: boolean } }
}
declare module "next-auth/jwt" {
  interface JWT { ownerVerified?: boolean }
}
