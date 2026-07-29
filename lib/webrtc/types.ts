import type { ComponentType } from "react";
import type { StyleProp, ViewStyle } from "react-native";

/** 플랫폼별 MediaStream 타입이 달라 any 로 추상화한다. */
export type StreamLike = unknown;

/**
 * 진료 연결 상태.
 * - connecting: 미디어 권한 확보 + 시그널링 접속 중
 * - waiting: 접속 완료, 상대 입장 대기
 * - connected: P2P 미디어 연결됨
 * - reconnecting: 일시 단절, ICE restart 로 자동 복구 시도 중
 * - ended: 정상 종료
 * - failed: 복구 실패(수동 재시도/폴백 필요)
 * - permission-denied: 카메라·마이크 권한 거부
 * - unavailable: 이 빌드에 WebRTC 네이티브 모듈이 없음(Expo Go 등)
 */
export type ConsultStatus =
  | "connecting"
  | "waiting"
  | "connected"
  | "reconnecting"
  | "ended"
  | "failed"
  | "permission-denied"
  | "unavailable";

/** 연결 품질 신호. relay=true 면 TURN 을 경유(직접 P2P 실패). */
export type ConnectionQuality = {
  relay: boolean;
};

export type ConsultHandle = {
  /** on 을 지정하면 그 값으로, 없으면 토글. 반환값은 '꺼짐(muted/off)' 여부. */
  toggleMic: (on?: boolean) => boolean;
  toggleCam: (on?: boolean) => boolean;
  /** 수동 재연결(ICE restart). 실패 상태에서 '다시 연결'에 사용. */
  restart: () => void;
  hangup: () => void;
};

export type StartConsultOpts = {
  roomId: string;
  wsUrl: string;
  ticket: string | null;
  onLocalStream?: (s: StreamLike) => void;
  onRemoteStream?: (s: StreamLike | null) => void;
  onStatus?: (s: ConsultStatus) => void;
  onQuality?: (q: ConnectionQuality) => void;
};

export type RTCVideoProps = {
  stream: StreamLike | null;
  style?: StyleProp<ViewStyle>;
  mirror?: boolean;
  objectFit?: "cover" | "contain";
};

export type WebRtcModule = {
  WEBRTC_AVAILABLE: boolean;
  startConsult: (opts: StartConsultOpts) => ConsultHandle;
  RTCVideo: ComponentType<RTCVideoProps>;
};
