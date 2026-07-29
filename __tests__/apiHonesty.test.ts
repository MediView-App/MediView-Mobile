/**
 * 데이터 계층 정직성 회귀 방지.
 * 실서버 모드에서 API 오류를 목/빈 데이터로 위장하지 않고 그대로 전파해야 한다.
 * (예전 버그: 실패 시 catch 로 mock 을 반환해 서버 장애를 '가짜 성공'으로 숨김)
 */
jest.mock("@/lib/config", () => ({ DEMO_MODE: false, API_URL: "http://x", WS_URL: "ws://x" }));
jest.mock("@/lib/api", () => ({ api: jest.fn() }));

import { api } from "@/lib/api";
import { listMyAppointments } from "@/api/appointments";
import { listDoctors } from "@/api/doctors";
import { listNotifications, unreadCount } from "@/api/notifications";

const mockedApi = api as jest.MockedFunction<typeof api>;
beforeEach(() => jest.clearAllMocks());

describe("예약", () => {
  it("서버 응답을 화면 표시용으로 매핑한다", async () => {
    mockedApi.mockResolvedValue([
      { id: 1, doctorId: 7, status: "SCHEDULED", scheduledAt: "2026-03-02T14:30:00", doctorName: "이수민" },
    ] as never);
    const list = await listMyAppointments();
    expect(list[0].doctorLabel).toBe("이수민");
    expect(list[0].status).toBe("SCHEDULED");
  });

  it("서버 오류를 삼키지 않고 전파한다(빈/목 위장 금지)", async () => {
    mockedApi.mockRejectedValue(new Error("500"));
    await expect(listMyAppointments()).rejects.toThrow();
  });
});

describe("의료진 목록", () => {
  it("서버 오류를 목 데이터로 위장하지 않는다", async () => {
    mockedApi.mockRejectedValue(new Error("network"));
    await expect(listDoctors()).rejects.toThrow();
  });
});

describe("알림", () => {
  it("목록 조회 오류를 전파한다", async () => {
    mockedApi.mockRejectedValue(new Error("boom"));
    await expect(listNotifications()).rejects.toThrow();
  });

  it("unreadCount 는 목록에서 미읽음 수를 파생한다", async () => {
    mockedApi.mockResolvedValue([
      { id: 1, title: "예약 확정", content: "", isRead: false },
      { id: 2, title: "결제 완료", content: "", isRead: true },
      { id: 3, title: "처방전", content: "", isRead: false },
    ] as never);
    expect(await unreadCount()).toBe(2);
  });

  it("unreadCount 는 부가 정보라 실패 시 조용히 0 (홈을 막지 않음)", async () => {
    mockedApi.mockRejectedValue(new Error("down"));
    expect(await unreadCount()).toBe(0);
  });
});
