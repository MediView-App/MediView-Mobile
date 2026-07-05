// 웹 폴백: 이 앱의 영상 진료는 네이티브(모바일) 대상이라 웹에서는 미지원으로 둔다.
// (브라우저 WebRTC 는 가능하나, react-native-web 에서의 영상 렌더링은 범위 밖)
export { WEBRTC_AVAILABLE, startConsult, RTCVideo } from "./index";
