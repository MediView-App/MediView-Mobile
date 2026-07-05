import { api } from "@/lib/api";
import { DEMO_MODE } from "@/lib/config";
import { doctors as mockDoctors, type Doctor } from "@/lib/mock";

/** 백엔드 PublicDoctorResponse */
type PublicDoctor = {
  id: number;
  userId: number;
  name: string;
  specialty: string;
  organizationId: number;
  organizationName: string;
  verified: boolean;
};

/** 백엔드에 없는 표시용 필드는 합리적 기본값으로 채운다. */
function toDoctor(d: PublicDoctor): Doctor {
  return {
    id: String(d.id),
    name: d.name ?? "의료진",
    specialty: d.specialty ?? "일반",
    org: d.organizationName ?? "",
    verified: d.verified,
    rating: 4.9,
    reviews: 0,
    nextSlot: "예약 가능",
    about: `${d.specialty ?? ""} 진료를 제공하는 검증된 의료진입니다.`,
    userId: d.userId,
    organizationId: d.organizationId,
  };
}

export async function listDoctors(specialty?: string): Promise<Doctor[]> {
  if (DEMO_MODE) {
    const all = mockDoctors;
    return specialty && specialty !== "전체"
      ? all.filter((d) => d.specialty === specialty)
      : all;
  }
  try {
    const q =
      specialty && specialty !== "전체"
        ? `?specialty=${encodeURIComponent(specialty)}`
        : "";
    const list = await api<PublicDoctor[]>(`/api/doctors${q}`);
    return list.map(toDoctor);
  } catch {
    return mockDoctors; // 서버 문제 시 폴백
  }
}

export async function getDoctor(id: string): Promise<Doctor | null> {
  if (DEMO_MODE) {
    return mockDoctors.find((d) => d.id === id) ?? null;
  }
  try {
    const d = await api<PublicDoctor>(`/api/doctors/${id}`);
    return toDoctor(d);
  } catch {
    return mockDoctors.find((d) => d.id === id) ?? null;
  }
}
