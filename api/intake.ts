import { api } from "@/lib/api";
import { DEMO_MODE } from "@/lib/config";

export type IntakeResult = {
  aiSummary?: string;
  triage?: string;
};

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
