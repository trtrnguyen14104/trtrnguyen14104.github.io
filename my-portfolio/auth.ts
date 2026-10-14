import "server-only";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { canSignIn } from "@/lib/cms/identity";
import { appOrigin, requiredEnv, requiredSecret } from "@/lib/cms/config";

export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  secret: requiredSecret("AUTH_SECRET"),
  trustHost: true,
  providers: [Google({ clientId: requiredEnv("AUTH_GOOGLE_ID"), clientSecret: requiredEnv("AUTH_GOOGLE_SECRET"), authorization: { params: { prompt: "select_account" } } })],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/admin/login", error: "/admin/login" },
  callbacks: {
    signIn({ account, profile }) { return canSignIn(account, profile); },
    jwt({ token, account, profile }) {
      if (account) token.ownerVerified = canSignIn(account, profile);
      return token;
    },
    session({ session, token }) {
      session.user.ownerVerified = token.ownerVerified === true;
      return session;
    },
    redirect({ url }) {
      const origin = appOrigin();
      try { const target = new URL(url, origin); return target.origin === origin ? target.href : `${origin}/admin`; }
      catch { return `${origin}/admin`; }
    },
  },
}));
