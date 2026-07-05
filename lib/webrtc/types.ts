import type { ComponentType } from "react";
import type { StyleProp, ViewStyle } from "react-native";

/** 플랫폼별 MediaStream 타입이 달라 any 로 추상화한다. */
export type StreamLike = unknown;

export type ConsultStatus = "connecting" | "waiting" | "connected" | "ended" | "error";

export type ConsultHandle = {
  /** on 을 지정하면 그 값으로, 없으면 토글. 반환값은 '꺼짐(muted/off)' 여부. */
  toggleMic: (on?: boolean) => boolean;
  toggleCam: (on?: boolean) => boolean;
  hangup: () => void;
};

export type StartConsultOpts = {
  roomId: string;
  wsUrl: string;
  ticket: string | null;
  onLocalStream?: (s: StreamLike) => void;
  onRemoteStream?: (s: StreamLike | null) => void;
  onStatus?: (s: ConsultStatus) => void;
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
