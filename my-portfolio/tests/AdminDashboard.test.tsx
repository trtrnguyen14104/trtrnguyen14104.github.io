import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { ContactInbox } from "@/components/admin/ContactInbox";
import { AdminApiError } from "@/components/admin/api";
import { portfolioData } from "@/data/portfolioData";
import type { ContactMessage, PortfolioSnapshot } from "@/types/cms";

const mocks = vi.hoisted(() => ({ request: vi.fn(), signOut: vi.fn() }));
vi.mock("next-auth/react", () => ({ signOut: mocks.signOut }));
vi.mock("@/components/admin/api", async (importOriginal) => ({ ...await importOriginal<typeof import("@/components/admin/api")>(), adminRequest: mocks.request }));
const initial = (): PortfolioSnapshot => ({ portfolio: structuredClone(portfolioData), version: 1, updatedAt: new Date().toISOString(), updatedBy: "owner" });
beforeEach(() => { vi.clearAllMocks(); vi.spyOn(window, "confirm").mockReturnValue(true); });

describe("portfolio administration", () => {
  it("shows the server-configured account independently of the public profile email", () => {
    render(<AdminDashboard initial={initial()} adminEmail="admin@example.com" />);
    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    expect(screen.getByLabelText("Email công khai")).toHaveValue(portfolioData.profile.email);
  });
  it("saves a profile section with its version and shows success", async () => {
    const snapshot = initial();
    mocks.request.mockResolvedValue({ ...snapshot, portfolio: { ...snapshot.portfolio, profile: { ...snapshot.portfolio.profile, name: "Updated owner" } }, version: 2 });
    render(<AdminDashboard initial={snapshot} adminEmail="admin@example.com" />);
    fireEvent.change(screen.getByLabelText("Họ tên"), { target: { value: "Updated owner" } });
    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    await screen.findByText("Đã lưu. Portfolio đã cập nhật.");
    const payload = JSON.parse(mocks.request.mock.calls[0][1].body);
    expect(payload.section).toBe("profile"); expect(payload.version).toBe(1); expect(payload.value.name).toBe("Updated owner");
    expect(screen.getByText("Phiên bản 2")).toBeInTheDocument();
  });
  it("retains unsaved content after a version conflict and reloads only after confirmation", async () => {
    mocks.request.mockRejectedValueOnce(new AdminApiError("Dữ liệu đã thay đổi.", "VERSION_CONFLICT"));
    render(<AdminDashboard initial={initial()} adminEmail="admin@example.com" />);
    fireEvent.change(screen.getByLabelText("Họ tên"), { target: { value: "Unsaved" } });
    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    await screen.findByText("Dữ liệu đã thay đổi.");
    expect(screen.getByLabelText("Họ tên")).toHaveValue("Unsaved");
    vi.mocked(window.confirm).mockReturnValueOnce(false);
    fireEvent.click(screen.getByRole("button", { name: "Tải dữ liệu mới nhất" }));
    expect(mocks.request).toHaveBeenCalledTimes(1);
    mocks.request.mockResolvedValueOnce({ ...initial(), version: 2 });
    fireEvent.click(screen.getByRole("button", { name: "Tải dữ liệu mới nhất" }));
    await screen.findByText("Đã tải dữ liệu mới nhất.");
    expect(screen.getByLabelText("Họ tên")).toHaveValue(portfolioData.profile.name);
  });
  it("warns on unsaved navigation and supports adding and reordering items", () => {
    render(<AdminDashboard initial={initial()} adminEmail="admin@example.com" />);
    fireEvent.change(screen.getByLabelText("Họ tên"), { target: { value: "Unsaved" } });
    vi.mocked(window.confirm).mockReturnValueOnce(false);
    fireEvent.click(screen.getByRole("button", { name: "Kỹ năng" }));
    expect(screen.getByLabelText("Họ tên")).toHaveValue("Unsaved");
    fireEvent.click(screen.getByRole("button", { name: "Kỹ năng" }));
    fireEvent.click(screen.getByRole("button", { name: "+ Thêm mục" }));
    const names = screen.getAllByLabelText("Tên kỹ năng");
    expect(names).toHaveLength(portfolioData.skills.length + 1);
    fireEvent.change(names.at(-1)!, { target: { value: "New skill" } });
    fireEvent.click(screen.getByLabelText(`Đưa mục ${names.length} lên`));
    expect(screen.getAllByLabelText("Tên kỹ năng").at(-2)).toHaveValue("New skill");
  });
  it("uploads an image, locks saving while uploading and binds its URL", async () => {
    let resolve!: (value: { url: string }) => void;
    mocks.request.mockImplementation(() => new Promise((r) => { resolve = r; }));
    render(<AdminDashboard initial={initial()} adminEmail="admin@example.com" />);
    fireEvent.change(screen.getByLabelText("Ảnh đại diện: tải ảnh"), { target: { files: [new File(["png"], "avatar.png", { type: "image/png" })] } });
    expect(screen.getByRole("button", { name: "Đang tải ảnh…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Dự án" })).toBeDisabled();
    resolve({ url: "https://res.cloudinary.com/test/image/upload/avatar.png" });
    await waitFor(() => expect(screen.getByLabelText("Ảnh đại diện: đường dẫn")).toHaveValue("https://res.cloudinary.com/test/image/upload/avatar.png"));
    expect(screen.getByRole("button", { name: "Lưu thay đổi" })).toBeEnabled();
  });
  it("shows upload failures and preserves the existing image", async () => {
    mocks.request.mockRejectedValue(new Error("Cloudinary unavailable"));
    render(<AdminDashboard initial={initial()} adminEmail="admin@example.com" />);
    fireEvent.change(screen.getByLabelText("Ảnh đại diện: tải ảnh"), { target: { files: [new File(["png"], "avatar.png", { type: "image/png" })] } });
    await screen.findByText("Cloudinary unavailable");
    expect(screen.getByLabelText("Ảnh đại diện: đường dẫn")).toHaveValue(portfolioData.profile.avatar);
  });
});

describe("contact inbox", () => {
  const message: ContactMessage = { id: "a".repeat(24), name: "Visitor", email: "visitor@example.com", subject: "Opportunity", message: "Hello from a visitor", status: "new", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), notification: { status: "failed", attempts: 1 } };
  it("opens details, exposes Gmail reply and marks a message read", async () => {
    mocks.request.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.includes("?")) return { items: [message], total: 1, page: 1, limit: 20 };
      if (init?.method === "PATCH") return { ...message, status: "read" };
      return message;
    });
    render(<ContactInbox />);
    fireEvent.click(await screen.findByRole("button", { name: /Visitor/ }));
    await screen.findByText("Hello from a visitor");
    expect(screen.getByRole("link", { name: "Trả lời trong Gmail" })).toHaveAttribute("href", expect.stringContaining("visitor%40example.com"));
    fireEvent.click(screen.getByRole("button", { name: "Đã đọc" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Đã đọc" })).toBeDisabled());
    expect(mocks.request).toHaveBeenCalledWith(`/api/admin/contacts/${message.id}`, expect.objectContaining({ method: "PATCH", body: JSON.stringify({ status: "read" }) }));
  });
  it("does not delete when confirmation is declined", async () => {
    mocks.request.mockImplementation(async (url: string) => url.includes("?") ? { items: [message], total: 1, page: 1, limit: 20 } : message);
    render(<ContactInbox />);
    fireEvent.click(await screen.findByRole("button", { name: /Visitor/ }));
    await screen.findByText("Hello from a visitor");
    vi.mocked(window.confirm).mockReturnValue(false);
    fireEvent.click(screen.getByRole("button", { name: "Xóa tin nhắn" }));
    expect(mocks.request.mock.calls.some(([, init]) => init?.method === "DELETE")).toBe(false);
  });
});
