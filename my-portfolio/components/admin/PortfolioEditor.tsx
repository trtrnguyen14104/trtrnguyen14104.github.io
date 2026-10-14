"use client";
/* eslint-disable @next/next/no-img-element -- Image previews support external HTTPS URLs without server-side fetching. */

import { useState } from "react";
import type { PortfolioData } from "@/types/portfolio";
import type { SectionName } from "@/lib/cms/schemas";
import { adminRequest } from "./api";

type Field = { key: string; label: string; kind?: "text" | "long" | "lines" | "number" | "check" | "color" | "image"; optional?: boolean; max?: number };
const fields: Record<SectionName, Field[]> = {
  profile: [
    { key: "name", label: "Họ tên", max: 100 }, { key: "role", label: "Chức danh", max: 150 },
    { key: "tagline", label: "Giới thiệu ngắn", kind: "long", max: 1000 }, { key: "location", label: "Địa điểm", max: 250 },
    { key: "email", label: "Email công khai", max: 254 }, { key: "phone", label: "Điện thoại", max: 50 },
    { key: "github", label: "GitHub" }, { key: "linkedin", label: "LinkedIn" },
    { key: "status", label: "Trạng thái công việc", max: 100 }, { key: "avatar", label: "Ảnh đại diện", kind: "image" },
  ],
  skills: [ { key: "name", label: "Tên kỹ năng", max: 100 }, { key: "category", label: "Nhóm kỹ năng", max: 100 }, { key: "level", label: "Mức độ (0–100)", kind: "number" }, { key: "icon", label: "Biểu tượng", kind: "image", optional: true } ],
  projects: [
    { key: "id", label: "ID duy nhất", max: 100 }, { key: "number", label: "Số hiển thị", max: 10 },
    { key: "title", label: "Tên dự án", max: 200 }, { key: "subtitle", label: "Vai trò và quy mô", max: 300 },
    { key: "tags", label: "Công nghệ", kind: "lines" }, { key: "description", label: "Mô tả", kind: "long", max: 5000 },
    { key: "bgColor", label: "Màu nền", kind: "color" }, { key: "accentColor", label: "Màu nhấn", kind: "color" },
    { key: "mockImages.left", label: "Ảnh bên trái", kind: "image" }, { key: "mockImages.main", label: "Ảnh chính", kind: "image" }, { key: "mockImages.right", label: "Ảnh bên phải", kind: "image" },
    { key: "links.github", label: "URL mã nguồn", optional: true }, { key: "links.demo", label: "URL demo", optional: true },
  ],
  experience: [
    { key: "id", label: "ID duy nhất", max: 100 }, { key: "role", label: "Chức danh", max: 200 }, { key: "company", label: "Công ty", max: 200 },
    { key: "employmentType", label: "Loại công việc", max: 100 }, { key: "period", label: "Thời gian", max: 200 }, { key: "location", label: "Địa điểm", max: 250 },
    { key: "teamSize", label: "Quy mô nhóm", optional: true, max: 100 }, { key: "summary", label: "Mô tả", kind: "long", max: 5000 },
    { key: "tech", label: "Công nghệ", kind: "lines" }, { key: "highlights", label: "Thành tựu", kind: "lines" }, { key: "isCurrent", label: "Công việc hiện tại", kind: "check", optional: true },
  ],
  education: [
    { key: "id", label: "ID duy nhất", max: 100 }, { key: "institution", label: "Trường học", max: 250 }, { key: "degree", label: "Bằng cấp", max: 250 },
    { key: "period", label: "Thời gian", max: 200 }, { key: "location", label: "Địa điểm", max: 250 }, { key: "gpa", label: "Điểm trung bình", optional: true, max: 100 },
    { key: "highlights", label: "Thành tích", kind: "lines", optional: true },
  ],
};
type Editable = Record<string, unknown>;
function readField(item: Editable, key: string): unknown {
  return key.split(".").reduce<unknown>((value, part) => value && typeof value === "object" ? (value as Editable)[part] : undefined, item);
}
function writeField(item: Editable, key: string, value: unknown): Editable {
  const updated = structuredClone(item); const path = key.split(".");
  let object = updated;
  for (const part of path.slice(0, -1)) { object[part] ??= {}; object = object[part] as Editable; }
  if (value === undefined) delete object[path.at(-1)!]; else object[path.at(-1)!] = value;
  return updated;
}
function newItem(section: SectionName): Editable {
  const item: Editable = {};
  for (const field of fields[section]) {
    if (field.optional) continue;
    const initial = field.kind === "lines" ? [] : field.kind === "number" ? 50 : field.kind === "color" ? "#4361ee" : field.key === "id" ? crypto.randomUUID() : "";
    Object.assign(item, writeField(item, field.key, initial));
  }
  if (section === "projects") item.links = {};
  return item;
}

function ImageField({ value, onChange, disabled, label, onUploadChange }: { value: string; onChange: (url: string) => void; disabled: boolean; label: string; onUploadChange: (delta: number) => void }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setError("Ảnh phải nhỏ hơn hoặc bằng 3 MiB."); return; }
    setBusy(true); setError(""); onUploadChange(1);
    try {
      const body = new FormData(); body.set("file", file);
      const result = await adminRequest<{ url: string }>("/api/admin/media", { method: "POST", body });
      onChange(result.url);
    } catch (error) { setError(error instanceof Error ? error.message : "Không thể tải ảnh."); }
    finally { setBusy(false); onUploadChange(-1); }
  }
  return <div className="cms-image">
    <input aria-label={`${label}: đường dẫn`} value={value} maxLength={2048} onChange={(e) => onChange(e.target.value)} disabled={disabled || busy} placeholder="/pictures/… hoặc https://…" />
    <label className="cms-upload">{busy ? "Đang tải ảnh…" : "Tải ảnh lên"}<input aria-label={`${label}: tải ảnh`} type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled || busy} onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ""; }} /></label>
    {value && <img src={value} alt={`Xem trước ${label.toLowerCase()}`} referrerPolicy="no-referrer" />}
    <small>JPEG, PNG, WebP · Tối đa 3 MiB</small>
    {error && <p role="alert" className="cms-error">{error}</p>}
  </div>;
}

export function PortfolioEditor({ section, value, onChange, disabled, onUploadChange }: { section: SectionName; value: PortfolioData[SectionName]; onChange: (value: PortfolioData[SectionName]) => void; disabled: boolean; onUploadChange: (delta: number) => void }) {
  const items = (section === "profile" ? [value] : value) as unknown as Editable[];
  function updateItem(index: number, item: Editable) {
    const next = items.map((current, position) => position === index ? item : current);
    onChange((section === "profile" ? item : next) as unknown as PortfolioData[SectionName]);
  }
  function reorder(index: number, delta: number) {
    const next = [...items]; [next[index], next[index + delta]] = [next[index + delta], next[index]];
    onChange(next as unknown as PortfolioData[SectionName]);
  }
  return <div className="cms-editor">
    {items.length === 0 && <p className="cms-empty">Chưa có mục nào. Thêm mục đầu tiên để hiển thị trên portfolio.</p>}
    {items.map((item, index) => <fieldset key={`${section}-${index}`} disabled={disabled} className="cms-entry">
      <legend>{section === "profile" ? "Thông tin cá nhân" : `${index + 1}. ${String(item.title ?? item.name ?? item.company ?? item.institution ?? "Mục mới") || "Mục mới"}`}</legend>
      {section !== "profile" && <div className="cms-entry-actions">
        <button type="button" disabled={index === 0} onClick={() => reorder(index, -1)} aria-label={`Đưa mục ${index + 1} lên`}>Lên</button>
        <button type="button" disabled={index === items.length - 1} onClick={() => reorder(index, 1)} aria-label={`Đưa mục ${index + 1} xuống`}>Xuống</button>
        <button type="button" className="cms-danger" onClick={() => { if (window.confirm("Xóa mục này khỏi nội dung? Thay đổi chỉ áp dụng sau khi lưu.")) onChange(items.filter((_, i) => i !== index) as unknown as PortfolioData[SectionName]); }}>Xóa mục</button>
      </div>}
      <div className="cms-fields">{fields[section].map((field) => {
        const current = readField(item, field.key);
        const fieldId = `${section}-${index}-${field.key}`;
        const display = Array.isArray(current) ? current.join("\n") : String(current ?? "");
        const change = (v: unknown) => updateItem(index, writeField(item, field.key, field.optional && v === "" ? undefined : v));
        return <div key={field.key} className={`cms-field ${["long", "lines", "image"].includes(field.kind ?? "") ? "cms-field-wide" : ""}`}>
          <label htmlFor={field.kind === "image" ? undefined : fieldId}>{field.label}{field.optional && <span> (tùy chọn)</span>}</label>
          {field.kind === "image" ? <ImageField label={field.label} value={display} disabled={disabled} onChange={change} onUploadChange={onUploadChange} />
            : field.kind === "check" ? <input id={fieldId} type="checkbox" checked={current === true} onChange={(e) => change(e.target.checked)} />
            : field.kind === "long" || field.kind === "lines" ? <><textarea id={fieldId} rows={field.kind === "lines" ? 4 : 5} value={display} maxLength={field.max ?? 100000} onChange={(e) => change(field.kind === "lines" ? e.target.value === "" ? [] : e.target.value.split("\n") : e.target.value)} />{field.kind === "lines" && <small>Mỗi dòng là một mục.</small>}</>
            : <input id={fieldId} type={field.kind === "number" ? "number" : "text"} min={field.kind === "number" ? 0 : undefined} max={field.kind === "number" ? 100 : undefined} maxLength={field.max ?? 2048} value={display} onChange={(e) => change(field.kind === "number" ? Number(e.target.value) : e.target.value)} />}
        </div>;
      })}</div>
    </fieldset>)}
    {section !== "profile" && <button type="button" disabled={disabled || items.length >= 100} className="cms-add" onClick={() => onChange([...items, newItem(section)] as unknown as PortfolioData[SectionName])}>+ Thêm mục</button>}
  </div>;
}
