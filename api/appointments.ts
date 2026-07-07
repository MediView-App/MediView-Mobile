import { api } from "@/lib/api";
import { DEMO_MODE, WS_URL } from "@/lib/config";
import { getWsTicket } from "./ws";
import type { AppointmentDto } from "@/lib/types";
import { appointments as mockAppointments } from "@/lib/mock";

/** 백엔드 DTO → 화면 표시용 요약 */
export type AppointmentView = {
  id: string;
  doctorLabel: string;
  when: string;
  status: AppointmentDto["status"];
};

/** 의료진 진료 대기열 항목 */
export type DoctorQueueItem = {
  appointmentId: number;
  patientName?: string;
  status: AppointmentDto["status"];
  scheduledAt?: string;
  queueOrder?: number;
  chiefComplaint?: string;
  triage?: "LOW" | "MEDIUM" | "HIGH";
};

export type QueueStatus = {
  appointmentId: number;
  status: AppointmentDto["status"];
  /** 내 앞 대기 인원. 0 = 내 차례, -1 = 종료/취소. */
  position: number;
};

/** 예약의 실시간 대기 순번. (데모는 null 반환 → 화면에서 시뮬레이션) */
export async function getQueueStatus(appointmentId: string | number): Promise<QueueStatus | null> {
  if (DEMO_MODE) return null;
  try {
    return await api<QueueStatus>(`/api/appointments/${appointmentId}/queue-status`);
  } catch {
    return null;
  }
}

export type QueueSocket = { close: () => void };

/**
 * 대기 순번 WebSocket 구독. 서버가 접속 즉시 + 대기열 변경 시 순번을 push 한다.
 * 티켓 발급 실패/데모면 null(호출 측에서 폴링으로 폴백).
 */
export async function connectQueue(
  appointmentId: string | number,
  onStatus: (s: QueueStatus) => void,
): Promise<QueueSocket | null> {
  if (DEMO_MODE) return null;
  const ticket = await getWsTicket();
  if (!ticket) return null;

  const ws = new WebSocket(
    `${WS_URL}/ws/queue/${appointmentId}?ticket=${encodeURIComponent(ticket)}`,
  );
  ws.onmessage = (ev: { data: unknown }) => {
    try {
      const raw = typeof ev.data === "string" ? ev.data : "";
      const d = JSON.parse(raw) as Partial<QueueStatus>;
      if (d && typeof d.position === "number") onStatus(d as QueueStatus);
    } catch {
      // 무시
    }
  };
  return { close: () => ws.close() };
}

/** 담당 의료인의 진료 대기열(완료·취소 제외). */
export async function getDoctorQueue(): Promise<DoctorQueueItem[]> {
  if (DEMO_MODE) {
    return [
      { appointmentId: 1, patientName: "김*수", status: "WAITING", queueOrder: 1, chiefComplaint: "3일 지속 · 인후통·기침, 미열", triage: "LOW" },
      { appointmentId: 2, patientName: "이*은", status: "WAITING", queueOrder: 2, chiefComplaint: "오늘 · 두드러기·가려움 · 기저: 알레르기", triage: "MEDIUM" },
      { appointmentId: 3, patientName: "박*호", status: "WAITING", queueOrder: 3, chiefComplaint: "고혈압 약 재처방 요청", triage: "LOW" },
    ];
  }
  try {
    return await api<DoctorQueueItem[]>("/api/appointments/doctor/queue");
  } catch {
    return [];
  }
}

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
