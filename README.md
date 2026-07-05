# MediView Mobile (Expo / React Native)

비대면 진료 **앱**. Expo(SDK 52) + Expo Router + TypeScript.
디자인 토큰은 [`../design/DESIGN_SYSTEM.md`](../design/DESIGN_SYSTEM.md) 를 단일 원본으로 따르며,
`theme/tokens.ts` 가 웹(`landing/app/globals.css`)과 동일한 팔레트를 미러링한다.

## 실행

```bash
cd mobile
npm install
npx expo start          # QR 스캔(Expo Go) 또는 i/a 로 시뮬레이터
npm run ios | android | web
```

> 실제 구동에는 iOS 시뮬레이터 / Android 에뮬레이터 / Expo Go 앱(실기기)이 필요합니다.

## 구조

```
theme/
  tokens.ts   # 팔레트 · 역할색(light/dark) · spacing · radius · typography · elevation
  theme.ts    # useTheme() — 시스템 라이트/다크 반영
components/
  Text.tsx    # 타이포 스케일 + 역할색 강제 텍스트
  Button.tsx  # pill 버튼(최소 52pt 터치 타깃)
  Card.tsx    # 라운드 + 소프트 elevation 카드
app/
  _layout.tsx # Expo Router 루트(SafeArea · StatusBar)
  index.tsx   # 홈 — 히어로 · 신뢰칩 · 진료 프리뷰 · 요약 · CTA
```

## 백엔드 연동

`lib/config.ts` 가 API 주소와 데모 모드를 관리합니다. 기본은 **데모 모드**(백엔드 없이 목 데이터로 동작).

| 설정 | 위치 | 설명 |
|---|---|---|
| `apiUrl` | `app.json > expo.extra.apiUrl` 또는 `EXPO_PUBLIC_API_URL` | 백엔드 주소. 실기기(Expo Go)는 `localhost` 대신 **개발 PC의 LAN IP** 사용 |
| `demoMode` | `app.json > expo.extra.demoMode` 또는 `EXPO_PUBLIC_DEMO_MODE` | `false` 로 두면 실제 API 호출 |

**실제 백엔드에 붙이기**
1. Spring 서버 실행(`JWT_SECRET`·`APP_ENCRYPTION_KEY` 주입, MariaDB 필요).
2. `app.json` 의 `extra.demoMode` 를 `false`, `extra.apiUrl` 을 서버 주소로.
3. 앱 재시작.

연동 레이어
- `lib/api.ts` — `ApiResponse<T>` 봉투 언랩 + **401 시 refresh 토큰 자동 재발급/재시도**
- `lib/storage.ts` — 토큰 보관(네이티브 SecureStore / 웹 localStorage)
- `context/AuthContext.tsx` — 부팅 시 세션 복원, `login`/`signup`/`logout`
- `api/*` — auth · appointments · kyc (데모/실서버 자동 분기, 네트워크 실패 시 목 폴백)

## 화상 진료 (WebRTC)

실제 영상 진료는 `react-native-webrtc`(네이티브 모듈)로 구현되어 있고, 백엔드 시그널링
(`/ws/webrtc/{roomId}`, JWT 티켓)에 연결됩니다.

- **네이티브 개발 빌드**에서 동작합니다. `react-native-webrtc` 는 Expo Go 에 링크되어 있지 않으므로,
  **Expo Go/웹에서는 자동으로 미리보기(목) 화면**으로 폴백됩니다(앱은 깨지지 않음).
- 구성: `lib/webrtc/*`(플랫폼별 구현 + 시그널링), `components/VideoConsult.tsx`, `api/ws.ts`(티켓).

**실제 영상으로 실행하려면(개발 빌드 필요)**
```bash
# 1) 개발 빌드 생성 (EAS 또는 로컬)
npx expo install expo-dev-client   # 이미 포함
eas build --profile development --platform ios   # 또는 android
#   (로컬: npx expo run:ios / run:android — Xcode/Android SDK 필요)

# 2) 개발 빌드 앱에서 dev 서버 접속
npx expo start --dev-client
```
> 카메라/마이크 권한은 `app.json`(ios.infoPlist / android.permissions)에 설정되어 있습니다.
> 2인 통화 규약: 먼저 방에 있던 쪽이 상대 입장 시 offer 를 생성합니다.

## 디자인 원칙
- 모든 색/타이포/간격은 `useTheme()` 를 통해서만 사용(하드코딩 금지).
- 터치 타깃 ≥ 44pt, 하단 안전영역(`useSafeAreaInsets`) 존중.
- 라이트/다크는 시스템 설정을 자동 반영.
- 폰트: 현재 시스템 폰트. Pretendard 적용 시 `expo-font` 로 로드 후 typography에 `fontFamily` 추가.
