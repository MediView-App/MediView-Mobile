import { api } from "@/lib/api";
import { DEMO_MODE } from "@/lib/config";
import type { AppointmentDto } from "@/lib/types";
import { appointments as mockAppointments } from "@/lib/mock";

/** 백엔드 DTO → 화면 표시용 요약 */
export type AppointmentView = {
  id: string;
  doctorLabel: string;
  when: string;
  status: AppointmentDto["status"];
};

function toView(a: AppointmentDto): AppointmentView {
  return {
    id: String(a.id),
    doctorLabel: `의료진 #${a.doctorId}`,
    when: a.scheduledAt
      ? new Date(a.scheduledAt).toLocaleString("ko-KR", {
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : a.queueOrder != null
      ? `대기 ${a.queueOrder}번`
      : "-",
    status: a.status,
  };
}

/** 내 예약 목록. 백엔드 미가동/데모 시 목 데이터로 폴백. */
export async function listMyAppointments(): Promise<AppointmentView[]> {
  if (DEMO_MODE) {
    return mockAppointments.map((a) => ({
      id: a.id,
      doctorLabel: `${a.doctor} · ${a.specialty}`,
      when: a.when,
      status: a.status,
    }));
  }
  try {
    const list = await api<AppointmentDto[]>("/api/appointments");
    return list.map(toView);
  } catch {
    // 네트워크/서버 문제 시 목으로 폴백
    return mockAppointments.map((a) => ({
      id: a.id,
      doctorLabel: `${a.doctor} · ${a.specialty}`,
      when: a.when,
      status: a.status,
    }));
  }
}

export async function createAppointment(input: {
  doctorId: number;
  organizationId: number;
  type: "QUEUE" | "RESERVED";
  scheduledAt?: string;
}): Promise<AppointmentDto> {
  return api<AppointmentDto>("/api/appointments", { method: "POST", body: input });
}
