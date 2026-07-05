import { api } from "@/lib/api";
import { DEMO_MODE } from "@/lib/config";
import type { KycResponse } from "@/lib/types";

function delay<T>(v: T, ms = 500): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}

export async function requestKyc(method: string, extra?: { phone?: string; name?: string }) {
  if (DEMO_MODE) {
    return delay<KycResponse>({
      id: 1,
      requestId: "demo-req-1",
      method,
      status: "PENDING",
    });
  }
  return api<KycResponse>("/api/kyc/request", {
    method: "POST",
    body: { method, ...extra },
  });
}

export async function verifyKyc(requestId: string, verificationCode: string) {
  if (DEMO_MODE) {
    return delay<KycResponse>({
      id: 1,
      requestId,
      method: "SMS",
      status: "VERIFIED",
      verifiedAt: new Date().toISOString(),
    });
  }
  return api<KycResponse>("/api/kyc/verify", {
    method: "POST",
    body: { requestId, verificationCode },
  });
}
