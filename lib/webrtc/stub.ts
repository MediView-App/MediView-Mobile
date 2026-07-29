// WebRTC 스텁 구현: 네이티브 모듈이 없는 환경(웹/Expo Go/타입체크)에서 사용된다.
// 실제 구현은 index.native.tsx 가 담당하며, Metro 가 플랫폼별로 해석한다.
//
// ⚠️ 이 파일은 플랫폼 확장자(.web/.native)를 갖지 않아야 한다.
//    index.web.ts 가 "./index" 를 재-export 하면 웹에서 자기 자신으로 해석되어
//    무한 재귀(Maximum call stack size exceeded)가 발생하므로, 스텁은 별도 파일로 둔다.
import type { StartConsultOpts, ConsultHandle, RTCVideoProps } from "./types";

export type {
  StartConsultOpts,
  ConsultHandle,
  ConsultStatus,
  StreamLike,
  RTCVideoProps,
} from "./types";

export const WEBRTC_AVAILABLE = false;

export function startConsult(opts: StartConsultOpts): ConsultHandle {
  // 네이티브 모듈이 없는 환경 — 미지원 상태를 알려 화면이 폴백 안내를 띄우게 한다.
  opts.onStatus?.("unavailable");
  return {
    toggleMic: () => false,
    toggleCam: () => false,
    restart: () => {},
    hangup: () => {},
  };
}

export function RTCVideo(_props: RTCVideoProps): null {
  return null;
}
