import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdminSession } from "@/lib/cms/identity";
import { authConfigured } from "@/lib/cms/config";
import { getAdminEmail } from "@/lib/cms/owner";
import { readPortfolio } from "@/lib/cms/portfolio";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  if (!authConfigured()) redirect("/admin/login");
  const session = await auth();
  if (!isAdminSession(session)) redirect("/admin/login");
  const initial = await readPortfolio();
  return <AdminDashboard initial={initial} adminEmail={getAdminEmail()} />;
}
