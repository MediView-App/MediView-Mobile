import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";

export type AsyncState = "loading" | "error" | "success";

export type AsyncResult<T> = {
  state: AsyncState;
  data: T | null;
  error: string | null;
  /** success 이면서 결과가 비었는가(배열이면 length 0, 그 외 isEmpty 옵션). */
  isEmpty: boolean;
  /** 마지막으로 성공 응답을 받은 시각(ms). 실패와 진짜 빈 상태를 구분하는 근거. */
  lastSyncedAt: number | null;
  refreshing: boolean;
  reload: () => void;
};

/**
 * 서버 데이터 화면의 4상태(loading/success/empty/error)를 분리해 관리한다.
 *
 * 원칙(PRODUCT.md): "상태를 숨기지 않는다." API 오류를 빈 배열/목으로 위장하지 않고
 * 그대로 error 상태로 드러내며, 마지막 동기화 시각과 재시도를 함께 제공한다.
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  opts?: { isEmpty?: (d: T) => boolean }
): AsyncResult<T> {
  const [state, setState] = useState<AsyncState>("loading");
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const mounted = useRef(true);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const isEmptyRef = useRef(opts?.isEmpty);
  isEmptyRef.current = opts?.isEmpty;

  const run = useCallback(async (isRefresh: boolean) => {
    if (isRefresh) setRefreshing(true);
    else setState("loading");
    setError(null);
    try {
      const d = await fnRef.current();
      if (!mounted.current) return;
      setData(d);
      setLastSyncedAt(Date.now());
      setState("success");
    } catch (e) {
      if (!mounted.current) return;
      const msg =
        e instanceof ApiError
          ? e.status === 0
            ? "네트워크에 연결할 수 없습니다."
            : e.message
          : "요청을 처리하지 못했습니다.";
      setError(msg);
      setState("error");
    } finally {
      if (mounted.current) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    run(false);
    return () => {
      mounted.current = false;
    };
  }, [run]);

  const isEmpty =
    state === "success" &&
    data != null &&
    (isEmptyRef.current
      ? isEmptyRef.current(data)
      : Array.isArray(data)
        ? data.length === 0
        : false);

  return {
    state,
    data,
    error,
    isEmpty,
    lastSyncedAt,
    refreshing,
    reload: () => run(true),
  };
}

/** "3분 전", "방금 전" 같은 상대 시각. 에러 화면의 '마지막 동기화' 힌트에 사용. */
export function formatSyncedAt(ts: number | null): string | undefined {
  if (!ts) return undefined;
  const diff = Math.max(0, Date.now() - ts);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "마지막 동기화: 방금 전";
  if (min < 60) return `마지막 동기화: ${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `마지막 동기화: ${hr}시간 전`;
  return `마지막 동기화: ${Math.floor(hr / 24)}일 전`;
}
