import { api, saveTokens, clearTokens } from "@/lib/api";
import { DEMO_MODE } from "@/lib/config";
import type { LoginResponse, SignupPayload, UserProfile } from "@/lib/types";

function delay<T>(v: T, ms = 600): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}

const demoUser: UserProfile = {
  id: 1,
  email: "minsu@example.com",
  name: "박민수",
  role: "PATIENT",
  status: "ACTIVE",
};

export async function login(email: string, password: string): Promise<UserProfile> {
  if (DEMO_MODE) {
    await saveTokens("demo.access.token", "demo.refresh.token");
    return delay({ ...demoUser, email: email || demoUser.email });
  }
  const res = await api<LoginResponse>("/api/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  await saveTokens(res.token, res.refreshToken);
  return me();
}

export async function signup(payload: SignupPayload): Promise<UserProfile> {
  if (DEMO_MODE) {
    await saveTokens("demo.access.token", "demo.refresh.token");
    return delay({ ...demoUser, email: payload.email, name: payload.name, role: payload.role });
  }
  const res = await api<LoginResponse>("/api/auth/signup", {
    method: "POST",
    auth: false,
    body: payload,
  });
  await saveTokens(res.token, res.refreshToken);
  return me();
}

export async function me(): Promise<UserProfile> {
  if (DEMO_MODE) return delay(demoUser, 200);
  return api<UserProfile>("/api/users/me");
}

export async function logout(refreshToken?: string): Promise<void> {
  if (!DEMO_MODE) {
    try {
      await api<void>("/api/auth/logout", {
        method: "POST",
        auth: false,
        body: { refreshToken: refreshToken ?? "" },
      });
    } catch {
      // 서버 실패해도 로컬 토큰은 정리
    }
  }
  await clearTokens();
}
