import { api } from "@/lib/api";
import { DEMO_MODE } from "@/lib/config";
import type { NotificationDto } from "@/lib/types";
import { notifications as mockNotifications, type Notification, type NotiType } from "@/lib/mock";

/** 백엔드 NotificationType → 앱 표시 타입(아이콘 매핑용) */
function toNotiType(dto: NotificationDto): NotiType {
  const t = (dto.title + " " + (dto.content ?? "")).toLowerCase();
  if (t.includes("결제") || t.includes("payment")) return "payment";
  if (t.includes("처방") || t.includes("서류") || t.includes("document")) return "document";
  if (t.includes("예약") || t.includes("진료")) return "appointment";
  return "system";
}

function toView(dto: NotificationDto): Notification {
  return {
    id: String(dto.id),
    type: toNotiType(dto),
    title: dto.title,
    body: dto.content ?? "",
    time: dto.createdAt
      ? new Date(dto.createdAt).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })
      : "",
    read: dto.isRead,
  };
}

export async function listNotifications(): Promise<Notification[]> {
  if (DEMO_MODE) return mockNotifications;
  try {
    const list = await api<NotificationDto[]>("/api/notifications");
    return list.map(toView);
  } catch {
    return mockNotifications;
  }
}

export async function markAsRead(id: string): Promise<void> {
  if (DEMO_MODE) return;
  try {
    await api<unknown>(`/api/notifications/${id}/read`, { method: "PUT" });
  } catch {
    // 무시(다음 조회에서 정합)
  }
}
