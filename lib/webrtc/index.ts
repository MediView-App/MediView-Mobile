// 기본(스텁) 구현: 네이티브 모듈이 없는 환경(웹/Expo Go/타입체크)에서 사용된다.
// 실제 구현은 index.native.tsx 가 담당하며, Metro 가 플랫폼별로 해석한다.
import type { StartConsultOpts, ConsultHandle, RTCVideoProps } from "./types";

export type {
  StartConsultOpts,
  ConsultHandle,
  ConsultStatus,
  StreamLike,
  RTCVideoProps,
} from "./types";

export const WEBRTC_AVAILABLE = false;

export function startConsult(_opts: StartConsultOpts): ConsultHandle {
  return {
    toggleMic: () => false,
    toggleCam: () => false,
    hangup: () => {},
  };
}

export function RTCVideo(_props: RTCVideoProps): null {
  return null;
}
