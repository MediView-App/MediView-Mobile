/** 백엔드 연동 전까지 사용하는 목 데이터. 실제 API 연결 시 lib/api 로 대체한다. */

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  org: string;
  verified: boolean;
  rating: number;
  reviews: number;
  nextSlot: string;
  about: string;
  /** 백엔드 연동 시 예약 생성에 필요한 식별자(데모에선 없음) */
  userId?: number;
  organizationId?: number;
};

export const doctors: Doctor[] = [
  {
    id: "1",
    name: "김서연",
    specialty: "내과",
    org: "연세미래의원",
    verified: true,
    rating: 4.9,
    reviews: 213,
    nextSlot: "오늘 14:30",
    about:
      "감기·소화기 질환 등 일상 진료를 정확하고 편안하게. 비대면 진료 5년 경력.",
  },
  {
    id: "2",
    name: "박준호",
    specialty: "피부과",
    org: "맑은피부클리닉",
    verified: true,
    rating: 4.8,
    reviews: 178,
    nextSlot: "오늘 16:00",
    about: "여드름·아토피·두드러기 상담. 생활 관리까지 함께 봐 드립니다.",
  },
  {
    id: "3",
    name: "이지우",
    specialty: "정신건강의학과",
    org: "마음쉼정신건강의학과",
    verified: true,
    rating: 5.0,
    reviews: 96,
    nextSlot: "내일 10:00",
    about: "수면·불안·스트레스 상담. 편안한 분위기에서 충분히 이야기해요.",
  },
  {
    id: "4",
    name: "정하늘",
    specialty: "소아청소년과",
    org: "튼튼아이의원",
    verified: true,
    rating: 4.9,
    reviews: 254,
    nextSlot: "오늘 15:15",
    about: "아이 발열·감기·예방접종 상담. 보호자 눈높이로 설명드립니다.",
  },
];

export type AppointmentStatus =
  | "SCHEDULED"
  | "WAITING"
  | "IN_PROGRESS"
  | "COMPLETED";

export type Appointment = {
  id: string;
  doctor: string;
  specialty: string;
  when: string;
  status: AppointmentStatus;
};

export const appointments: Appointment[] = [
  {
    id: "a1",
    doctor: "김서연",
    specialty: "내과",
    when: "오늘 14:30",
    status: "SCHEDULED",
  },
  {
    id: "a2",
    doctor: "정하늘",
    specialty: "소아청소년과",
    when: "6월 28일",
    status: "COMPLETED",
  },
  {
    id: "a3",
    doctor: "이지우",
    specialty: "정신건강의학과",
    when: "6월 20일",
    status: "COMPLETED",
  },
];

export const statusLabel: Record<AppointmentStatus, string> = {
  SCHEDULED: "예약됨",
  WAITING: "대기 중",
  IN_PROGRESS: "진료 중",
  COMPLETED: "완료",
};

export type NotiType = "appointment" | "payment" | "document" | "system";

export type Notification = {
  id: string;
  type: NotiType;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

export const notifications: Notification[] = [
  {
    id: "n1",
    type: "appointment",
    title: "진료가 곧 시작돼요",
    body: "김서연 의료진과의 진료가 10분 후 시작됩니다.",
    time: "방금 전",
    read: false,
  },
  {
    id: "n2",
    type: "document",
    title: "처방전이 발급됐어요",
    body: "급성 상기도 감염 처방전을 서류함에서 확인하세요.",
    time: "1시간 전",
    read: false,
  },
  {
    id: "n3",
    type: "payment",
    title: "결제가 완료됐어요",
    body: "내과 진료비 12,000원 결제가 완료되었습니다.",
    time: "1시간 전",
    read: true,
  },
  {
    id: "n4",
    type: "system",
    title: "본인확인이 완료됐어요",
    body: "이제 MediView의 모든 기능을 이용할 수 있어요.",
    time: "어제",
    read: true,
  },
];

export type DocType = "PRESCRIPTION" | "CONFIRMATION" | "OPINION";

export type MedDocument = {
  id: string;
  type: DocType;
  title: string;
  doctor: string;
  org: string;
  issuedAt: string;
  status: "ISSUED" | "DRAFT";
};

export const documents: MedDocument[] = [
  {
    id: "d1",
    type: "PRESCRIPTION",
    title: "처방전 · 급성 상기도 감염",
    doctor: "김서연",
    org: "연세미래의원",
    issuedAt: "오늘 14:52",
    status: "ISSUED",
  },
  {
    id: "d2",
    type: "CONFIRMATION",
    title: "진료확인서",
    doctor: "정하늘",
    org: "튼튼아이의원",
    issuedAt: "6월 28일",
    status: "ISSUED",
  },
  {
    id: "d3",
    type: "OPINION",
    title: "소견서",
    doctor: "이지우",
    org: "마음쉼정신건강의학과",
    issuedAt: "6월 20일",
    status: "ISSUED",
  },
];

export const docTypeLabel: Record<DocType, string> = {
  PRESCRIPTION: "처방전",
  CONFIRMATION: "진료확인서",
  OPINION: "소견서",
};
