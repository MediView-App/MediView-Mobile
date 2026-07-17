import { api } from "@/lib/api";
import { DEMO_MODE } from "@/lib/config";

export type IntakeResult = {
  aiSummary?: string;
  triage?: string;
};

/** 백엔드 IntakeFormResponse */
export type IntakeForm = {
  id: number;
  appointmentId: number;
  rawText?: string;
  structuredJson?: string;
  aiSummary?: string;
  triage?: string;
  submittedAt?: string;
};

/** 문진 상세(담당의/환자만). 여러 건이면 최신 1건. 없으면 null. */
export async function getIntake(appointmentId: string | number): Promise<IntakeForm | null> {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 400));
    return {
      id: 1,
      appointmentId: Number(appointmentId) || 1,
      rawText: "어제부터 목이 아프고 기침이 나요. 미열도 조금 있습니다.",
      structuredJson: JSON.stringify({ duration: "2~3일", conditions: ["알레르기"] }),
      aiSummary: "2~3일 지속 · 어제부터 목이 아프고 기침이 나요 · 기저: 알레르기",
      triage: "LOW",
    };
  }
  try {
    const list = await api<IntakeForm[]>(`/api/appointments/${appointmentId}/intakes`);
    return list.length ? list[list.length - 1] : null;
  } catch {
    return null;
  }
}

/** structuredJson 에서 기간/기저질환을 안전하게 뽑는다. */
export function parseIntakeMeta(form: IntakeForm | null): { duration?: string; conditions: string[] } {
  if (!form?.structuredJson) return { conditions: [] };
  try {
    const o = JSON.parse(form.structuredJson) as { duration?: string; conditions?: string[] };
    return { duration: o.duration, conditions: Array.isArray(o.conditions) ? o.conditions : [] };
  } catch {
    return { conditions: [] };
  }
}

/**
 * 사전 문진 제출. 서버가 요약/트리아지를 생성해 담당의에게 노출한다.
 * (백엔드: POST /api/appointments/{appointmentId}/intakes)
 */
export async function submitIntake(
  appointmentId: string | number,
  symptoms: string,
  duration: string | null,
  conditions: string[],
): Promise<IntakeResult> {
  const structuredJson = JSON.stringify({ duration: duration ?? undefined, conditions });
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 500));
    return { aiSummary: symptoms.slice(0, 60), triage: "LOW" };
  }
  return api<IntakeResult>(`/api/appointments/${appointmentId}/intakes`, {
    method: "POST",
    body: { rawText: symptoms, structuredJson },
  });
}
