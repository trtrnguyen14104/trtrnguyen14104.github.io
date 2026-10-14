"use client";

import { useEffect, useState } from "react";
import type { ContactMessage, ContactStatus } from "@/types/cms";
import { adminRequest } from "./api";

const statusNames: Record<ContactStatus, string> = { new: "Mới", read: "Đã đọc", archived: "Đã lưu trữ" };
const notificationNames = { pending: "Chưa gửi", sending: "Đang gửi hoặc bị gián đoạn", sent: "Đã gửi Gmail", failed: "Gửi Gmail thất bại" };
type Inbox = { items: ContactMessage[]; total: number; page: number; limit: number };
export function ContactInbox() {
  const [status, setStatus] = useState(""); const [page, setPage] = useState(1);
  const [inbox, setInbox] = useState<Inbox | null>(null); const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [loading, setLoading] = useState(true); const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    adminRequest<Inbox>(`/api/admin/contacts?page=${page}&limit=20${status ? `&status=${status}` : ""}`).then((data) => {
      if (active) { setInbox(data); setError(""); }
    }).catch((error) => { if (active) setError(error instanceof Error ? error.message : "Không thể tải hộp thư."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, status, revision]);
  async function openMessage(item: ContactMessage) {
    setBusy(true); setError("");
    try {
      const detail = await adminRequest<ContactMessage>(`/api/admin/contacts/${item.id}`);
      setSelected(detail);
    } catch (error) { setError(error instanceof Error ? error.message : "Không thể mở tin nhắn."); }
    finally { setBusy(false); }
  }
  async function act(kind: "status" | "delete" | "notify", value?: ContactStatus) {
    if (!selected || busy) return;
    if (kind === "delete" && !window.confirm("Xóa vĩnh viễn tin nhắn này?")) return;
    setBusy(true); setError("");
    try {
      if (kind === "status") setSelected(await adminRequest<ContactMessage>(`/api/admin/contacts/${selected.id}`, { method: "PATCH", body: JSON.stringify({ status: value }) }));
      if (kind === "delete") { await adminRequest(`/api/admin/contacts/${selected.id}`, { method: "DELETE" }); setSelected(null); }
      if (kind === "notify") {
        const result = await adminRequest<{ status: string }>(`/api/admin/contacts/${selected.id}/notify`, { method: "POST" });
        setSelected(await adminRequest<ContactMessage>(`/api/admin/contacts/${selected.id}`));
        if (result.status !== "sent") setError("Thông báo chưa gửi được. Kiểm tra cấu hình Gmail rồi thử lại.");
      }
      setRevision((v) => v + 1);
    } catch (error) { setError(error instanceof Error ? error.message : "Thao tác thất bại."); }
    finally { setBusy(false); }
  }
  function refresh() { setLoading(true); setSelected(null); setRevision((v) => v + 1); }
  return <section aria-label="Hộp thư liên hệ">
    <div className="cms-inbox-toolbar">
      <label>Lọc trạng thái <select value={status} disabled={busy} onChange={(e) => { setStatus(e.target.value); setPage(1); setSelected(null); setLoading(true); }}><option value="">Tất cả</option>{Object.entries(statusNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <button onClick={refresh} disabled={busy || loading}>Làm mới</button>
    </div>
    {error && <p role="alert" className="cms-error">{error}</p>}
    <div className="cms-inbox">
      <div className="cms-message-list" aria-busy={loading}>
        {loading ? <p role="status">Đang tải hộp thư…</p> : inbox?.items.length ? inbox.items.map((item) => <button key={item.id} disabled={busy} aria-pressed={selected?.id === item.id} onClick={() => void openMessage(item)} className="cms-message-row">
          <span><strong>{item.name}</strong><small>{statusNames[item.status]}</small></span>
          <b>{item.subject}</b><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString("vi-VN")}</time>
        </button>) : <p className="cms-empty">Chưa có tin nhắn trong mục này.</p>}
      </div>
      <article className="cms-message-detail">{selected ? <>
        <h2>{selected.subject}</h2><p>{selected.name} &lt;{selected.email}&gt;</p>
        <p className="cms-notification">{notificationNames[selected.notification.status]} · {selected.notification.attempts} lần thử</p>
        <div className="cms-message-body">{selected.message}</div>
        <div className="cms-message-actions">
          <a className="cms-button cms-primary" target="_blank" rel="noopener noreferrer" href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selected.email)}&su=${encodeURIComponent(`Re: ${selected.subject}`)}`}>Trả lời trong Gmail</a>
          {Object.entries(statusNames).map(([value, label]) => <button key={value} disabled={busy || selected.status === value} onClick={() => void act("status", value as ContactStatus)}>{label}</button>)}
          {selected.notification.status !== "sent" && <button disabled={busy} onClick={() => void act("notify")}>Gửi lại thông báo</button>}
          <button className="cms-danger" disabled={busy} onClick={() => void act("delete")}>Xóa tin nhắn</button>
        </div>
      </> : <p className="cms-empty">Chọn một tin nhắn để xem nội dung.</p>}</article>
    </div>
    <div className="cms-pagination"><button disabled={page === 1 || loading || busy} onClick={() => { setPage((v) => v - 1); setSelected(null); setLoading(true); }}>Trang trước</button><span>Trang {page} · {inbox?.total ?? 0} tin</span><button disabled={!inbox || page * inbox.limit >= inbox.total || loading || busy} onClick={() => { setPage((v) => v + 1); setSelected(null); setLoading(true); }}>Trang sau</button></div>
  </section>;
}
