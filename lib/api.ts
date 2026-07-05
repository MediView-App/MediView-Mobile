import { API_URL } from "./config";
import { getItem, setItem, deleteItem, KEYS } from "./storage";
import type { ApiEnvelope, LoginResponse } from "./types";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function saveTokens(access: string, refresh: string) {
  await setItem(KEYS.accessToken, access);
  await setItem(KEYS.refreshToken, refresh);
}

export async function clearTokens() {
  await deleteItem(KEYS.accessToken);
  await deleteItem(KEYS.refreshToken);
}

export async function getAccessToken() {
  return getItem(KEYS.accessToken);
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean; // 기본 true: Authorization 헤더 부착
  _retried?: boolean;
};

/**
 * 백엔드 호출 래퍼.
 * - ApiResponse<T> 봉투를 벗겨 data 를 반환한다.
 * - 401 이면 refresh 토큰으로 한 번 재발급 후 재시도한다.
 */
export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, _retried = false } = opts;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = await getItem(KEYS.accessToken);
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("네트워크에 연결할 수 없습니다.", 0);
  }

  // 401 → refresh 후 1회 재시도
  if (res.status === 401 && auth && !_retried) {
    const refreshed = await tryRefresh();
    if (refreshed) return api<T>(path, { ...opts, _retried: true });
  }

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // 바디 없음
  }

  if (!res.ok || (payload && payload.statusCode >= 400)) {
    throw new ApiError(payload?.message || `요청 실패 (${res.status})`, res.status);
  }
  return (payload ? payload.data : (undefined as T));
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = await getItem(KEYS.refreshToken);
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      await clearTokens();
      return false;
    }
    const payload = (await res.json()) as ApiEnvelope<LoginResponse>;
    await saveTokens(payload.data.token, payload.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}
