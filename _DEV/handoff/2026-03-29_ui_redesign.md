# 2026-03-29 UI 리디자인 핸드오프

## 세션 요약
소개로드 앱 스타일을 참고하여 전반적인 UI 리디자인 진행. 디자인 시스템 정비 + 지도 UX 개선 + 온보딩 추가.

## 완료 작업

### 1. 레이아웃 시스템 변경
- **전체 배경**: `bg-white` → `bg-gray-50` (연회색), 콘텐츠는 흰색 카드 (`bg-white rounded-2xl shadow-sm`)
- **fullWidth 페이지**(지도): `bg-white` 유지
- Observe, Profile, Auth 페이지 모두 카드 스타일 적용

### 2. 바텀 내비 플로팅
- `fixed` 포지셔닝 + `bg-white/70 backdrop-blur-xl` 글래스모피즘
- `rounded-2xl` 캡슐형 + 하단/좌우 마진
- fullWidth 페이지는 하단 여백 없음 (네비가 지도 위에 떠 있음)
- Auth 페이지에도 바텀 내비 표시 (`hideNav` 제거)

### 3. 헤더바 리디자인
- 브랜드 그린(`bg-brand`) 배경 + 흰색 텍스트
- 홈: 좌정렬 "바스락" (extrabold, tracking-widest) + "시민 산불 감시" 태그라인 + 우측 LevelBadge
- 다른 페이지: 뒤로가기 + 타이틀
- 스크롤 시 축소 (h-16 → h-12) + backdrop-blur

### 4. 타이포그래피 계층 강화
- `typo-page-title`: extrabold + tracking-tight
- `typo-section-label`: text-xs + tracking-widest
- 신규: `typo-body-strong`, `typo-sub`, `typo-number`, `typo-number-sm`
- `typo-body`에 `leading-relaxed` 추가

### 5. 위험도 컬러 시스템 변경
- 낮음: `#81C784` (연한 그린)
- 보통: `#FFE300` (밝은 노랑)
- 높음: `#FF6D00` (선명한 오렌지)
- 매우 높음: `#D32F2F` (선명한 빨강)
- CSS `@theme`와 `constants/theme.js` 동기화 완료

### 6. 지도 개선
- **초기 뷰**: center `[35.8, 127.7]`, zoom 7, 남한 맞춤
- **maxBounds**: `[28.0, 124.5]` ~ `[42.0, 132.0]` 패닝 제한
- **SVG renderer padding**: 2.0 (동심원 잘림 방지)
- **줌 버튼 제거**: 핀치 줌만 사용
- **Leaflet attribution 제거**
- **내 위치 파란 점 마커**: coords prop으로 자동 표시
- **내 위치 버튼 제거** (초기 단계에서 불필요)
- **영향권 반경**: 동적 계산 → 고정 10km
- **Leaflet z-index**: `z-1`로 제한 (헤더/네비/모달 아래)

### 7. 범례 리디자인
- 우하단 2x2 그리드 (`bottom-32 right-6`)
- `bg-white/80 backdrop-blur-sm rounded-xl`
- "24h · N건" 표시

### 8. 관측 모달 개선
- **Leaflet 팝업 제거** → 마커 클릭 시 커스텀 모달만
- **모달 위치**: 바텀시트 → 화면 중앙
- **근접 관측 묶기**: 줌 레벨에 따라 동적 범위 (줌7: ~50km, 줌13: ~800m)
- **복수 관측 요약**: 관측 건수, 기간, 평균 위험도, 평균 건조도/풍속 + 범위 표시
- **단일 관측**: 기존 상세 카드 유지

### 9. 온보딩 (최초 1회)
- 3장 스와이프: 낙엽 관찰 → 위험 지도 생성 → 함께 지켜요
- 브랜드 그린 배경 + 큰 이모지 + 인디케이터
- `localStorage` 기반 1회 표시, dev 모드에서는 매번 표시

### 10. EmptyMapOverlay 강화
- "시민이 만드는 산불 위험 지도" 타이틀
- 3단계 관측 방법 안내 (건조도 → 풍속 → 등록)
- "첫 관측 시작하기" CTA

### 11. 위치 안내 강화 (LocationStatus)
- denied: 왜 필요한지 + iPhone Safari/Chrome, Android 각각 설정 경로
- error: GPS 신호 안내 + 다시 시도 버튼
- timeout: 5초 → 15초, enableHighAccuracy 추가

### 12. 프로필 페이지 리디자인 (소개로드 스타일)
- 프로필 헤더: 등급 아이콘(원형) + 닉네임/이메일/등급명
- 요약 카드 2열: 연속 관찰 일수 + 총 포인트
- 등급 배지 카드 (프로그레스바)
- 메뉴 아코디언: 포인트 이력 / 내 관찰 (chevron + 접기/펼치기)
- 로그아웃 버튼 하단 분리

### 13. 데이터 갱신
- `useMapObservations`: 5분 간격 재fetch 추가 (기존 1회 + Realtime)

## 변경 파일 (주요)
- `src/components/layout/TopBar.jsx` — 헤더 리디자인
- `src/components/layout/BottomNav.jsx` — 플로팅 네비
- `src/components/layout/PageLayout.jsx` — 배경색, 여백 로직
- `src/components/map/KakaoMap.jsx` — 지도 설정, 내 위치 마커
- `src/components/map/MapLegend.jsx` — 범례 리디자인
- `src/components/map/ObservationSheet.jsx` — 모달 + 요약카드
- `src/components/map/ObservationLayer.jsx` — 근접 묶기
- `src/components/map/EmptyMapOverlay.jsx` — 강화
- `src/components/observation/LocationStatus.jsx` — 안내 강화
- `src/components/onboarding/OnboardingSlides.jsx` — 신규
- `src/components/ui/Modal.jsx` — 중앙 정렬, 스크롤
- `src/pages/Profile.jsx` — 전면 리디자인
- `src/pages/Observe.jsx` — 카드 스타일
- `src/pages/Auth.jsx` — 카드 스타일, 네비 표시
- `src/pages/Home.jsx` — 온보딩, 내 위치, 정리
- `src/utils/circleMode.js` — 영향권 10km 고정, 팝업 제거
- `src/hooks/useMapObservations.js` — 5분 갱신
- `src/hooks/useLocation.js` — 타임아웃 15초
- `src/index.css` — 컬러, 타이포, Leaflet z-index
- `src/constants/theme.js` — 위험도 컬러 동기화

## 미완료 / 다음 작업
- 커밋 미진행 (재시작 후 커밋 필요)
- 온보딩 스와이프 애니메이션 (현재 cut 전환)
- 헤더 스크롤 반응이 Observe/Profile에서는 main 스크롤 기반 — 동작 검증 필요
- 프로필 아바타 이미지 업로드 (현재 등급 이모지)
