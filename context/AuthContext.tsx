import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getAccessToken } from "@/lib/api";
import { getItem, KEYS } from "@/lib/storage";
import * as authApi from "@/api/auth";
import type { SignupPayload, UserProfile } from "@/lib/types";

type Status = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: Status;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<UserProfile | null>(null);

  // 부팅 시 저장된 토큰으로 세션 복원
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          if (alive) setStatus("unauthenticated");
          return;
        }
        const profile = await authApi.me();
        if (alive) {
          setUser(profile);
          setStatus("authenticated");
        }
      } catch {
        if (alive) setStatus("unauthenticated");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      login: async (email, password) => {
        const profile = await authApi.login(email, password);
        setUser(profile);
        setStatus("authenticated");
      },
      signup: async (payload) => {
        const profile = await authApi.signup(payload);
        setUser(profile);
        setStatus("authenticated");
      },
      logout: async () => {
        const refresh = await getItem(KEYS.refreshToken);
        await authApi.logout(refresh ?? undefined);
        setUser(null);
        setStatus("unauthenticated");
      },
    }),
    [status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
