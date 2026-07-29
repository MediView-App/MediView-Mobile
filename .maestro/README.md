# E2E 플로우 (Maestro)

핵심 사용자 여정을 실제 기기/에뮬레이터에서 검증하는 [Maestro](https://maestro.mobile.dev) 플로우입니다.
Jest 단위·통합 테스트가 커버하지 못하는 화면 전환·입력·내비게이션을 end-to-end 로 확인합니다.

## 실행

```bash
# 1) 앱을 기기/시뮬레이터에 설치(개발 빌드 권장)
#    데모 계정 흐름은 EXPO_PUBLIC_DEMO_MODE=true 개발 빌드에서 가장 안정적입니다.
# 2) Maestro 설치: https://maestro.mobile.dev/getting-started/installing-maestro
maestro test .maestro                 # 전체 플로우
maestro test .maestro/01-login.yaml   # 개별 플로우
```

## 커버하는 여정 (검토 P2-3)

| 파일 | 여정 |
|---|---|
| `01-login.yaml` | 온보딩 → 로그인 → 홈 진입 |
| `02-browse-and-book.yaml` | 의료진 탐색 → 상세 → 예약 시작 |
| `03-appointments.yaml` | 예약 목록 → 상세/진료 준비 |
| `04-logout.yaml` | 마이 → 로그아웃 → 재로그인 화면 |

> 셀렉터는 화면의 한글 텍스트를 기준으로 합니다. 문구가 바뀌면 함께 갱신하세요.
> 계정 없이 도는 데모 흐름과, 실서버 계정이 필요한 흐름을 주석으로 구분했습니다.
