"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import type { PortfolioData } from "@/types/portfolio";
import type { PortfolioSnapshot } from "@/types/cms";
import { sectionSchemas } from "@/lib/cms/schemas";
import { AdminApiError, adminRequest } from "./api";
import { PortfolioEditor } from "./PortfolioEditor";
import { ContactInbox } from "./ContactInbox";

const labels = { profile: "Hồ sơ", skills: "Kỹ năng", projects: "Dự án", experience: "Kinh nghiệm", education: "Học vấn", inbox: "Hộp thư" };
type Tab = keyof typeof labels;
export function AdminDashboard({ initial, adminEmail }: { initial: PortfolioSnapshot; adminEmail: string }) {
  const [snapshot, setSnapshot] = useState(initial); const [draft, setDraft] = useState<PortfolioData>(initial.portfolio);
  const [tab, setTab] = useState<Tab>("profile"); const [busy, setBusy] = useState(false);
  const [uploads, setUploads] = useState(0);
  const locked = busy || uploads > 0;
  const [error, setError] = useState(""); const [notice, setNotice] = useState(""); const [conflict, setConflict] = useState(false);
  const dirty = tab !== "inbox" && JSON.stringify(draft[tab]) !== JSON.stringify(snapshot.portfolio[tab]);
  useEffect(() => {
    if (!dirty && !uploads) return;
    function warn(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = ""; }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, uploads]);
  function canLeave() { return !uploads && (!dirty || window.confirm("Bạn có thay đổi chưa lưu. Bỏ các thay đổi này?")); }
  function select(next: Tab) {
    if (next === tab || locked || !canLeave()) return;
    setDraft(snapshot.portfolio); setTab(next); setError(""); setNotice(""); setConflict(false);
  }
  async function reload() {
    if (!canLeave()) return;
    setBusy(true);
    try { const fresh = await adminRequest<PortfolioSnapshot>("/api/admin/portfolio"); setSnapshot(fresh); setDraft(fresh.portfolio); setConflict(false); setError(""); setNotice("Đã tải dữ liệu mới nhất."); }
    catch (error) { setError(error instanceof Error ? error.message : "Không thể tải dữ liệu."); }
    finally { setBusy(false); }
  }
  async function save() {
    if (tab === "inbox" || locked) return;
    setError(""); setNotice("");
    // Remove blank lines from list fields without preventing normal multiline editing.
    const normalized = JSON.parse(JSON.stringify(draft[tab], (_key, value) => Array.isArray(value) && value.every((v) => typeof v === "string") ? value.map((v: string) => v.trim()).filter(Boolean) : value));
    const validation = sectionSchemas[tab].safeParse(normalized);
    if (!validation.success) {
      setError(validation.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "));
      return;
    }
    setBusy(true);
    try {
      const updated = await adminRequest<PortfolioSnapshot>("/api/admin/portfolio", { method: "PATCH", body: JSON.stringify({ section: tab, value: validation.data, version: snapshot.version }) });
      setSnapshot(updated); setDraft(updated.portfolio); setConflict(false); setNotice("Đã lưu. Portfolio đã cập nhật.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể lưu dữ liệu.");
      setConflict(error instanceof AdminApiError && error.code === "VERSION_CONFLICT");
    } finally { setBusy(false); }
  }
  return <div className="cms-shell">
    <header className="cms-titlebar"><span className="cms-window-mark" aria-hidden="true">▦</span><strong>Portfolio — Quản trị nội dung</strong><span className="cms-owner">{adminEmail}</span></header>
    <div className="cms-workspace">
      <aside className="cms-sidebar"><p>Nội dung portfolio</p><nav aria-label="Quản trị">{Object.entries(labels).map(([key, label]) => <button key={key} disabled={locked} aria-current={tab === key ? "page" : undefined} onClick={() => select(key as Tab)}>{label}</button>)}</nav>
        <a href="/" target="_blank" rel="noopener noreferrer" onClick={(e) => { if (!canLeave()) e.preventDefault(); }}>Xem portfolio</a>
        <button disabled={locked} onClick={() => { if (canLeave()) void signOut({ callbackUrl: "/admin/login" }); }}>Đăng xuất</button>
      </aside>
      <main className="cms-content">
        <div className="cms-heading"><div><h1>{labels[tab]}</h1><p>{tab === "inbox" ? "Tin nhắn từ khách truy cập portfolio." : "Lưu thay đổi để cập nhật nội dung công khai."}</p></div>
          {tab !== "inbox" && <button className="cms-primary" disabled={!dirty || locked || conflict} onClick={() => void save()}>{uploads ? "Đang tải ảnh…" : busy ? "Đang lưu…" : "Lưu thay đổi"}</button>}
        </div>
        {error && <p role="alert" className="cms-error">{error}</p>}{notice && <p role="status" className="cms-success">{notice}</p>}
        {conflict && <button disabled={busy} onClick={() => void reload()}>Tải dữ liệu mới nhất</button>}
        {tab === "inbox" ? <ContactInbox /> : <PortfolioEditor key={tab} section={tab} value={draft[tab]} disabled={locked} onUploadChange={(delta) => setUploads((v) => v + delta)} onChange={(value) => { setDraft((current) => ({ ...current, [tab]: value })); setNotice(""); }} />}
      </main>
    </div>
    <footer className="cms-statusbar"><span>{dirty ? "Có thay đổi chưa lưu" : "Đã đồng bộ"}</span><span>Phiên bản {snapshot.version}</span></footer>
  </div>;
}
