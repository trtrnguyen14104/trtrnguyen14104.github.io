export class AdminApiError extends Error {
  constructor(message: string, public code: string) { super(message); }
}
export async function adminRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store", headers: { ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...init?.headers } });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result || !("data" in result)) {
    throw new AdminApiError(result?.error?.message ?? "Không thể kết nối. Vui lòng thử lại.", result?.error?.code ?? "NETWORK_ERROR");
  }
  return result.data as T;
}
