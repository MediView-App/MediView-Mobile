import Constants from "expo-constants";

type Extra = {
  apiUrl?: string;
  demoMode?: boolean;
  stunUrls?: string;
  turnUrl?: string;
  turnUsername?: string;
  turnCredential?: string;
};

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

/**
 * WebRTC ICE 서버 목록.
 *
 * STUN 만으로는 대칭형 NAT/모바일 캐리어망에서 P2P 가 실패한다. 인프라의 coturn
 * TURN 서버를 함께 지정하면 릴레이로 폴백해 연결 성공률이 크게 오른다.
 * 설정: EXPO_PUBLIC_TURN_URL / _TURN_USERNAME / _TURN_CREDENTIAL 또는 app.json extra.
 */
export type IceServer = { urls: string; username?: string; credential?: string };

const STUN_URLS =
  process.env.EXPO_PUBLIC_STUN_URLS || extra.stunUrls || "stun:stun.l.google.com:19302";

const TURN_URL = process.env.EXPO_PUBLIC_TURN_URL || extra.turnUrl || "";
const TURN_USERNAME = process.env.EXPO_PUBLIC_TURN_USERNAME || extra.turnUsername || "";
const TURN_CREDENTIAL =
  process.env.EXPO_PUBLIC_TURN_CREDENTIAL || extra.turnCredential || "";

function buildIceServers(): IceServer[] {
  const servers: IceServer[] = String(STUN_URLS)
    .split(",")
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0)
    .map((urls: string) => ({ urls }));

  if (TURN_URL) {
    String(TURN_URL)
      .split(",")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0)
      .forEach((urls: string) => {
        servers.push({ urls, username: TURN_USERNAME, credential: TURN_CREDENTIAL });
      });
  }
  return servers;
}

export const ICE_SERVERS: IceServer[] = buildIceServers();

/** TURN 서버가 설정되어 있는지(연결 실패 시 진단·안내에 사용). */
export const HAS_TURN = TURN_URL.length > 0;
