import Constants from "expo-constants";

type Extra = { apiUrl?: string; demoMode?: boolean };

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

/**
 * API 기본 URL.
 * - 시뮬레이터: http://localhost:8080
 * - 실기기(Expo Go): 개발 PC 의 LAN IP 로 바꿔야 합니다. 예) http://192.168.0.10:8080
 *   app.json 의 extra.apiUrl 또는 EXPO_PUBLIC_API_URL 로 지정하세요.
 */
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || extra.apiUrl || "http://localhost:8080";

/**
 * 데모 모드. true 면 백엔드 없이 목 데이터로 동작(로그인/조회 시뮬레이션).
 *
 * 운영 안전을 위해 **기본값은 false** 이며, 명시적으로 켠 경우에도 **개발 빌드(__DEV__)에서만** 허용한다.
 * 프로덕션 릴리스에서는 어떤 설정이든 데모가 켜지지 않는다(실서버 강제).
 * 켜는 방법(개발 전용): app.json 의 extra.demoMode=true 또는 EXPO_PUBLIC_DEMO_MODE=true.
 */
const demoRequested =
  process.env.EXPO_PUBLIC_DEMO_MODE != null
    ? process.env.EXPO_PUBLIC_DEMO_MODE === "true"
    : extra.demoMode ?? false;

export const DEMO_MODE = __DEV__ && demoRequested;

/** WebSocket 기본 URL (http→ws, https→wss). */
export const WS_URL = API_URL.replace(/^http/, "ws");
