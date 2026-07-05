import { api } from "@/lib/api";
import { DEMO_MODE } from "@/lib/config";
import type { PaymentMethodApi, PaymentResponse } from "@/lib/types";

function delay<T>(v: T, ms = 700): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}

/** 앱 결제 수단 → 백엔드 PaymentMethod */
export function toApiMethod(key: string): PaymentMethodApi {
  switch (key) {
    case "toss":
      return "TRANSFER";
    case "kakao":
    case "card":
    default:
      return "CARD";
  }
}

export async function preparePayment(input: {
  appointmentId: number;
  amount: number;
  method: PaymentMethodApi;
}): Promise<PaymentResponse> {
  if (DEMO_MODE) {
    return delay({
      id: 1,
      appointmentId: input.appointmentId,
      amount: input.amount,
      status: "PENDING",
      method: input.method,
    });
  }
  return api<PaymentResponse>("/api/payments/prepare", { method: "POST", body: input });
}

export async function confirmPayment(input: {
  paymentId: number;
  pgTxId: string;
}): Promise<PaymentResponse> {
  if (DEMO_MODE) {
    return delay({
      id: input.paymentId,
      appointmentId: 1,
      amount: 12000,
      status: "PAID",
      method: "CARD",
      pgTxId: input.pgTxId,
      paidAt: new Date().toISOString(),
    });
  }
  return api<PaymentResponse>("/api/payments/confirm", { method: "POST", body: input });
}

/**
 * 결제 전체 흐름: prepare → (PG 결제 시뮬레이션) → confirm.
 * 실제 앱에서는 PG SDK 결제 후 발급된 pgTxId 로 confirm 을 호출한다.
 */
export async function payForAppointment(
  appointmentId: number,
  amount: number,
  methodKey: string
): Promise<PaymentResponse> {
  const prepared = await preparePayment({
    appointmentId,
    amount,
    method: toApiMethod(methodKey),
  });
  const pgTxId = `demo-pg-${Date.now()}`;
  return confirmPayment({ paymentId: prepared.id, pgTxId });
}
