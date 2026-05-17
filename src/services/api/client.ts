// Cliente HTTP central — preparado para backend próprio (REST + JWT)
// Hoje é um stub que apenas guarda token e URL base; substituível por fetch real.

const TOKEN_KEY = "waekium.auth.token";

export const apiClient = {
  baseUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? "/api",

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string | null) {
    if (typeof window === "undefined") return;
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  },

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers || {}),
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  },
};
