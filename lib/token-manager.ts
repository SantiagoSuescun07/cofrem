const ACCESS_TOKEN_KEY = "cofrem.access_token";
const EXPIRES_AT_KEY = "cofrem.expires_at";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function isExpired(): boolean {
  const raw = localStorage.getItem(EXPIRES_AT_KEY);
  if (!raw) return true;
  return Date.now() > Number(raw) - 30_000; // 30s de margen
}

export function clearToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
}
