/**
 * 실서버 예약 정보 매핑 — 방금 제거한 "mock 하드코딩" 버그의 회귀 방지.
 * 실서버 응답이 오면 반드시 그 이름이 쓰여야 하고, mock 으로 새면 안 된다.
 */
import { renderHook, waitFor } from "@testing-library/react-native";

jest.mock("@/lib/config", () => ({ DEMO_MODE: false, API_URL: "http://x", WS_URL: "ws://x" }));
jest.mock("@/lib/api", () => ({ api: jest.fn() }));

import { api } from "@/lib/api";
import { useAppointment } from "@/lib/useAppointment";

const mockedApi = api as jest.MockedFunction<typeof api>;

beforeEach(() => jest.clearAllMocks());

it("실서버 응답의 담당의 이름을 사용한다(mock 으로 새지 않음)", async () => {
  mockedApi.mockResolvedValue({
    id: 42,
    patientId: 1,
    doctorId: 7,
    organizationId: 3,
    type: "RESERVED",
    status: "SCHEDULED",
    scheduledAt: "2026-03-02T14:30:00",
    doctorName: "이수민",
    specialty: "피부과",
    organizationName: "미래의원",
  } as never);

  const { result } = renderHook(() => useAppointment("42"));
  await waitFor(() => expect(result.current).not.toBeNull());

  expect(result.current!.doctorName).toBe("이수민");
  expect(result.current!.specialty).toBe("피부과");
  expect(result.current!.organizationName).toBe("미래의원");
  // 예전 버그: 목록에 없으면 mock[0]("김서연")이 보였음
  expect(result.current!.doctorName).not.toBe("김서연");
});

it("대기번호만 있으면 대기 표기로 보여준다", async () => {
  mockedApi.mockResolvedValue({
    id: 9, patientId: 1, doctorId: 7, organizationId: 3,
    type: "QUEUE", status: "WAITING", queueOrder: 3, doctorName: "박준호",
  } as never);

  const { result } = renderHook(() => useAppointment("9"));
  await waitFor(() => expect(result.current).not.toBeNull());
  expect(result.current!.when).toBe("대기 3번");
});

it("조회 실패해도 화면이 비지 않도록 폴백한다", async () => {
  mockedApi.mockRejectedValue(new Error("network"));
  const { result } = renderHook(() => useAppointment("a1"));
  await waitFor(() => expect(result.current).not.toBeNull());
  expect(result.current!.doctorName).toBeTruthy();
});
