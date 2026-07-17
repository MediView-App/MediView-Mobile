import { api } from "@/lib/api";
import { DEMO_MODE } from "@/lib/config";
import { getDocumentDetail } from "./documents";
import { createAppointment } from "./appointments";
import { submitIntake } from "./intake";
import type { AppointmentDto } from "@/lib/types";

/**
 * 재처방 요청 — 기존 처방전을 근거로 같은 담당의에게 새 진료(대기)를 생성하고,
 * 문진에 "재처방 요청 + 약품 목록"을 자동 제출해 의료진이 맥락을 바로 보게 한다.
 * 신규 백엔드 없이 기존 예약/문진 API 를 재사용한다.
 *
 * ⚠️ 재처방도 의료인의 진료·판단을 거친다(자동 처방 아님).
 */
export async function requestRefill(documentId: string | number): Promise<{ appointmentId: number }> {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 700));
    return { appointmentId: 1 };
  }

  const detail = await getDocumentDetail(documentId);
  if (!detail) throw new Error("처방전 정보를 불러오지 못했습니다.");

  // 원 처방의 예약에서 담당의/기관을 얻는다.
  const origin = await api<AppointmentDto>(`/api/appointments/${detail.appointmentId}`);

  const created = await createAppointment({
    doctorId: origin.doctorId,
    organizationId: origin.organizationId,
    type: "QUEUE",
  });

  // 재처방 맥락을 문진으로 전달(실패해도 예약 자체는 유지).
  const drugs = (detail.prescription?.drugs ?? []).map((d) => d.name).filter(Boolean);
  try {
    await submitIntake(
      created.id,
      `재처방 요청입니다. 기존 처방: ${drugs.length ? drugs.join(", ") : "이전 처방 참고"}. 증상 변화 없이 동일 약 재처방을 희망합니다.`,
      null,
      [],
    );
  } catch {
    // 문진 제출 실패는 예약을 막지 않는다.
  }

  return { appointmentId: created.id };
}
