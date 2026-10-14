import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signIn } from "@/auth";
import { authConfigured } from "@/lib/cms/config";
import { getAdminEmail } from "@/lib/cms/owner";
import { isAdminSession } from "@/lib/cms/identity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const configured = authConfigured();
  const adminEmail = configured ? getAdminEmail() : null;
  if (configured && isAdminSession(await auth())) redirect("/admin");
  const { error } = await searchParams;
  return <main className="cms-login">
    <div className="cms-login-window"><header className="cms-titlebar">Portfolio — Đăng nhập quản trị</header><div className="cms-login-body">
      <span className="cms-login-icon" aria-hidden="true">▦</span><h1>Quản trị portfolio</h1><p>Đăng nhập bằng tài khoản Google của chủ portfolio.</p>
      {error && configured && <p role="alert" className="cms-error">Không thể đăng nhập. Chỉ tài khoản Google {adminEmail} đã xác minh được cấp quyền.</p>}
      {!configured && <p role="alert" className="cms-error">Đăng nhập chưa được cấu hình trên môi trường này.</p>}
      <form action={async () => { "use server"; await signIn("google", { redirectTo: "/admin" }); }}><button className="cms-primary" disabled={!configured}>Đăng nhập bằng Google</button></form>
      <Link href="/">Về portfolio</Link>
    </div></div>
  </main>;
}
