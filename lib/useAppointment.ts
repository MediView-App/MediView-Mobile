import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DEMO_MODE } from "@/lib/config";
import { appointments as mockAppointments, doctors as mockDoctors } from "@/lib/mock";
import type { AppointmentDto } from "@/lib/types";

/** 화면 표시에 필요한 진료 정보(실서버/데모 공통). */
export type AppointmentInfo = {
  id: string;
  doctorName: string;
  specialty: string;
  organizationName: string;
  when: string;
  status: string;
};

function fromDto(a: AppointmentDto): AppointmentInfo {
  return {
    id: String(a.id),
    doctorName: a.doctorName ?? "담당 의료진",
    specialty: a.specialty ?? "",
    organizationName: a.organizationName ?? "",
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

/** 데모용 폴백 — 실서버 실패 시에도 화면이 비지 않게 한다. */
function demoInfo(id: string): AppointmentInfo {
  const appt = mockAppointments.find((a) => a.id === id) ?? mockAppointments[0];
  const doc = mockDoctors.find((d) => d.name === appt.doctor) ?? mockDoctors[0];
  return {
    id,
    doctorName: appt.doctor,
    specialty: appt.specialty,
    organizationName: doc.org,
    when: appt.when,
    status: appt.status,
  };
}

/**
 * 예약 정보를 실서버에서 가져온다. 데모 모드이거나 조회 실패 시 목 데이터로 폴백.
 * (이전에는 화면들이 mock 을 하드코딩해 실서버에서도 남의 이름이 보였다.)
 */
export function useAppointment(id: string | undefined) {
  const [info, setInfo] = useState<AppointmentInfo | null>(null);

  useEffect(() => {
    const key = String(id ?? "");
    if (DEMO_MODE) {
      setInfo(demoInfo(key));
      return;
    }
    let alive = true;
    api<AppointmentDto>(`/api/appointments/${key}`)
      .then((dto) => alive && setInfo(fromDto(dto)))
      .catch(() => alive && setInfo(demoInfo(key)));
    return () => {
      alive = false;
    };
  }, [id]);

  return info;
}
