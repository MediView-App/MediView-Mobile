/**
 * useAsync 4상태 머신 회귀 방지.
 * 오류를 빈/목 데이터로 위장하지 않고 error 로 드러내는 것이 핵심(P0 실데이터 전환).
 */
jest.mock("@/lib/config", () => ({ DEMO_MODE: false }));
jest.mock("@/lib/api", () => {
  class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.name = "ApiError";
      this.status = status;
    }
  }
  return { ApiError, api: jest.fn() };
});

import { renderHook, waitFor, act } from "@testing-library/react-native";
import { ApiError } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";

it("로딩 → 성공: 데이터를 담고 lastSyncedAt 을 기록한다", async () => {
  const { result } = renderHook(() => useAsync(async () => [1, 2, 3]));
  expect(result.current.state).toBe("loading");
  await waitFor(() => expect(result.current.state).toBe("success"));
  expect(result.current.data).toEqual([1, 2, 3]);
  expect(result.current.lastSyncedAt).toBeGreaterThan(0);
  expect(result.current.isEmpty).toBe(false);
});

it("빈 배열이면 isEmpty=true (진짜 빈 상태)", async () => {
  const { result } = renderHook(() => useAsync(async () => [] as number[]));
  await waitFor(() => expect(result.current.state).toBe("success"));
  expect(result.current.isEmpty).toBe(true);
});

it("네트워크 오류(status 0)는 전용 메시지로", async () => {
  const { result } = renderHook(() =>
    useAsync(async () => {
      throw new ApiError("boom", 0);
    }),
  );
  await waitFor(() => expect(result.current.state).toBe("error"));
  expect(result.current.error).toBe("네트워크에 연결할 수 없습니다.");
  expect(result.current.data).toBeNull(); // 빈 데이터로 위장하지 않음
});

it("서버 오류는 서버 메시지를 그대로 노출", async () => {
  const { result } = renderHook(() =>
    useAsync(async () => {
      throw new ApiError("이미 처리된 예약입니다.", 409);
    }),
  );
  await waitFor(() => expect(result.current.state).toBe("error"));
  expect(result.current.error).toBe("이미 처리된 예약입니다.");
});

it("ApiError 가 아닌 오류는 일반 메시지로", async () => {
  const { result } = renderHook(() =>
    useAsync(async () => {
      throw new Error("weird");
    }),
  );
  await waitFor(() => expect(result.current.state).toBe("error"));
  expect(result.current.error).toBe("요청을 처리하지 못했습니다.");
});

it("reload 로 실패 후 재시도해 성공으로 전환", async () => {
  let ok = false;
  const { result } = renderHook(() =>
    useAsync(async () => {
      if (!ok) throw new ApiError("일시 오류", 500);
      return ["회복"];
    }),
  );
  await waitFor(() => expect(result.current.state).toBe("error"));
  ok = true;
  await act(async () => {
    result.current.reload();
  });
  await waitFor(() => expect(result.current.state).toBe("success"));
  expect(result.current.data).toEqual(["회복"]);
});
