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
 * 실제 백엔드에 붙이려면 app.json 의 extra.demoMode 를 false 로, apiUrl 을 서버 주소로 설정.
 */
export const DEMO_MODE =
  process.env.EXPO_PUBLIC_DEMO_MODE != null
    ? process.env.EXPO_PUBLIC_DEMO_MODE === "true"
    : extra.demoMode ?? true;

/** WebSocket 기본 URL (http→ws, https→wss). */
export const WS_URL = API_URL.replace(/^http/, "ws");
