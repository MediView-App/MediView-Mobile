/** 백엔드 DTO 와 매칭되는 프론트 타입. */

export type UserRole = "PATIENT" | "DOCTOR" | "ADMIN";

/** 공통 응답 봉투: ApiResponse<T> = { statusCode, message, data } */
export type ApiEnvelope<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type LoginResponse = {
  token: string;
  refreshToken: string;
  email: string;
  role: UserRole;
};

export type UserProfile = {
  id: number;
  email: string;
  phone?: string;
  role: UserRole;
  status?: string;
  name?: string;
  birthdate?: string;
  gender?: string;
};

export type SignupPayload = {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
};

export type AppointmentType = "QUEUE" | "RESERVED";
export type AppointmentStatusApi =
  | "SCHEDULED"
  | "WAITING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type AppointmentDto = {
  id: number;
  patientId: number;
  doctorId: number;
  organizationId: number;
  type: AppointmentType;
  status: AppointmentStatusApi;
  scheduledAt?: string;
  queueOrder?: number;
  createdAt?: string;
  /** 표시용(백엔드가 함께 내려줌) */
  doctorName?: string;
  specialty?: string;
  organizationName?: string;
};

export type KycResponse = {
  id: number;
  requestId: string;
  method: string;
  status: "PENDING" | "VERIFIED" | "FAILED" | "EXPIRED";
  verifiedAt?: string;
  expiresAt?: string;
};

export type NotificationDto = {
  id: number;
  type: "EMAIL" | "SMS" | "IN_APP";
  title: string;
  content?: string;
  isRead: boolean;
  createdAt?: string;
};

export type PaymentMethodApi = "CARD" | "TRANSFER" | "VIRTUAL_ACCOUNT";
export type PaymentStatusApi =
  | "PENDING"
  | "PAID"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED"
  | "FAILED";

export type PaymentResponse = {
  id: number;
  appointmentId: number;
  amount: number;
  status: PaymentStatusApi;
  method: PaymentMethodApi;
  pgTxId?: string;
  paidAt?: string;
};
