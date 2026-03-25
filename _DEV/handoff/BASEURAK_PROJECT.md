# 바스락 프로젝트 — Claude Code 개발 가이드

> 시민과학 기반 산불위험 실시간 모니터링 플랫폼  
> 국립산림과학원 산불연구과 연구 연계 프로젝트

---

## 개요

시민이 스마트폰으로 낙엽 건조도(바스락 지수)와 체감 풍속을 기록하면,
전국 실시간 산불위험 지도가 촘촘해지는 시민과학 플랫폼.

**핵심 루프**: 관측 입력 → GPS 위치 기록 → 실시간 지도 반영 → 기여도 피드백 → 재참여

---

## 기술 스택

| 역할 | 기술 |
|------|------|
| 프론트엔드 | React 18 + Vite |
| 스타일링 | Tailwind CSS |
| 백엔드/DB | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| 지도 | Kakao Maps JavaScript API v3 |
| 배포 | Vercel |
| 버전관리 | Git + GitHub |

---

## 인프라 제약 (무료 플랜 기준)

개발 및 초기 운영은 전부 무료 플랜으로 진행. 추후 사용량에 따라 유료 전환.

| 서비스 | 무료 한도 | 주의사항 |
|--------|-----------|----------|
| **Supabase** | DB 500MB, Storage 1GB, 50,000 MAU, Realtime 200 동시접속 | 2주 비활성 시 프로젝트 pause → 개발 중 주기적 접속 필요 |
| **GitHub** | 무제한 public/private repo, Actions 2,000분/월 | Vercel 연동은 private repo도 가능 |
| **Vercel** | 100GB 대역폭/월, Serverless 100GB-hr | 단일 계정 운영, 팀 기능 없음 |
| **Kakao Maps** | 300,000 호출/일 | 앱 키 도메인 제한 설정 필수 (localhost + Vercel 도메인) |

---

## PWA / 레이아웃 원칙

```
모바일 (< 430px): full width
기준 (430px):     max-width: 430px, centered
데스크탑 (> 430px): max-width: 430px, centered, 배경 처리
```

```css
/* App.jsx 최상위 레이아웃 */
.app-container {
  width: 100%;
  max-width: 430px;
  min-height: 100dvh;
  margin: 0 auto;
  position: relative;
  overflow-x: hidden;
}
```

**PWA 필수 설정**:
- `public/manifest.json` — 앱 이름(바스락), 아이콘, 테마 컬러
- `vite.config.js` — `vite-plugin-pwa` 플러그인
- Service Worker — 오프라인 캐싱 (Session 1에서 기본 설정)

---

## 컴포넌트 원칙

> **모든 UI는 컴포넌트로 분리. 페이지(pages/)는 레이아웃 조합과 훅 호출만 담당.**

```
pages/        → 라우트 진입점. 컴포넌트 조합 + useXxx 훅 호출만
components/   → 모든 UI 단위. 로직 포함 가능하나 특정 페이지에 종속 금지
hooks/        → 데이터/상태 로직. UI 코드 없음
lib/          → 외부 서비스 클라이언트 초기화
utils/        → 순수 함수 (계산, 포맷팅 등)
```

**페이지 파일 예시**:
```jsx
// pages/Observe.jsx — 오직 조합만
export default function ObservePage() {
  const { location } = useLocation()
  const { submit, loading } = useObservation()
  return (
    <PageLayout>
      <ObserveHeader />
      <LocationStatus location={location} />
      <DrynessSelector />
      <WindSelector />
      <PhotoAttach />
      <SubmitButton loading={loading} onSubmit={submit} />
    </PageLayout>
  )
}
```

---

## 프로젝트 구조

```
baseurak/
├── public/
│   ├── manifest.json
│   └── icons/                      # PWA 아이콘 (192px, 512px)
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── PageLayout.jsx      # 430px 컨테이너 래퍼
│   │   │   ├── TopBar.jsx
│   │   │   └── BottomNav.jsx       # 하단 탭 네비게이션
│   │   ├── ui/                     # 원자 단위 공통 컴포넌트
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Spinner.jsx
│   │   │   └── Badge.jsx
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── SignupForm.jsx
│   │   ├── observation/
│   │   │   ├── DrynessSelector.jsx   # 바스락 4단계 선택
│   │   │   ├── WindSelector.jsx      # 풍속 6단계 선택
│   │   │   ├── PhotoAttach.jsx       # 사진/영상 첨부
│   │   │   ├── LocationStatus.jsx    # GPS 상태 표시
│   │   │   └── SubmitButton.jsx
│   │   ├── map/
│   │   │   ├── KakaoMap.jsx          # 지도 마운트/생명주기
│   │   │   ├── RiskMarker.jsx        # 위험도별 커스텀 마커
│   │   │   └── MapLegend.jsx         # 범례
│   │   └── profile/
│   │       ├── LevelBadge.jsx
│   │       ├── PointHistory.jsx
│   │       └── MyObservations.jsx
│   ├── pages/
│   │   ├── Home.jsx                  # 메인 지도
│   │   ├── Observe.jsx               # 관측 입력
│   │   ├── Profile.jsx               # 내 기여 현황
│   │   └── Auth.jsx                  # 로그인/회원가입
│   ├── hooks/
│   │   ├── useLocation.js            # GPS 획득
│   │   ├── useObservation.js         # 관측 제출/조회
│   │   ├── useAuth.js                # 인증 상태
│   │   └── useProfile.js             # 프로필/포인트
│   ├── lib/
│   │   ├── supabase.js               # Supabase 클라이언트 (단일 초기화)
│   │   └── kakao.js                  # Kakao Maps 동적 로드 유틸
│   └── utils/
│       └── riskCalculator.js         # 위험 점수 계산/색상
├── supabase/
│   └── migrations/
│       └── 20260321_001_initial_schema.sql
├── .env.local
├── .gitignore                        # .env.local 반드시 포함
├── vite.config.js
└── vercel.json
```

---

## Supabase 스키마

```sql
-- 사용자 프로필 (auth.users 확장)
create table profiles (
  id uuid references auth.users primary key,
  nickname text,
  level integer default 1,
  total_points integer default 0,
  created_at timestamptz default now()
);

-- 관측 데이터 (핵심 테이블)
create table observations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  lat double precision not null,
  lng double precision not null,
  dryness_level integer not null check (dryness_level between 1 and 4),
  wind_level integer not null check (wind_level between 1 and 6),
  risk_score integer generated always as (dryness_level + wind_level) stored,
  photo_url text,
  observed_at timestamptz default now()
);

-- 포인트 이력
create table point_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  points integer not null,
  reason text,   -- 'observation' | 'streak' | 'bonus'
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table observations enable row level security;
alter table point_logs enable row level security;

create policy "본인 프로필만 수정" on profiles
  for all using (auth.uid() = id);

create policy "관측 전체 조회 가능" on observations
  for select using (true);

create policy "로그인 사용자만 관측 등록" on observations
  for insert with check (auth.uid() = user_id);

create policy "본인 포인트 이력만 조회" on point_logs
  for select using (auth.uid() = user_id);

-- 회원가입 시 profiles 자동 생성 트리거
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

---

## 핵심 데이터 모델

### 바스락 지수 (낙엽 건조도 4단계)

| 단계 | 판별 기준 | 위험도 | 색상 |
|------|-----------|--------|------|
| 1 | 뭉쳤을 때 물기가 묻어남 | 낮음 | `#4CAF50` |
| 2 | 물기 없음 + 낙엽이 구겨짐 | 다소 높음 | `#FFC107` |
| 3 | 물기 없음 + 낙엽이 쪼개짐 | 높음 | `#FF9800` |
| 4 | 물기 없음 + 잘게 바스라짐 | 매우 높음 | `#F44336` |

### 체감 풍속 6단계

| 단계 | 기준 | 설명 |
|------|------|------|
| 1 | 나뭇가지 정지 | 바람 없음 |
| 2 | 나뭇잎 흔들림 | 산들바람 |
| 3 | 작은 가지 흔들림 | 약한 바람 |
| 4 | 큰 가지 흔들림 | 보통 바람 |
| 5 | 나무 전체 흔들림 | 강한 바람 |
| 6 | 걷기 어려움 | 매우 강한 바람 |

### 위험 점수

```js
// risk_score = dryness_level + wind_level (범위: 2~10)
export const getRiskColor = (score) => {
  if (score <= 3) return '#4CAF50'
  if (score <= 5) return '#FFC107'
  if (score <= 7) return '#FF9800'
  return '#F44336'
}

export const getRiskLabel = (score) => {
  if (score <= 3) return '낮음'
  if (score <= 5) return '보통'
  if (score <= 7) return '높음'
  return '매우 높음'
}
```

---

## 개발 세션 계획

> 각 세션은 Claude Code 컨텍스트 **200k 이내**로 완결되도록 범위를 제한.  
> 세션 시작 시 반드시 이 문서 전체를 컨텍스트에 포함할 것.

---

### Session 1 — 프로젝트 초기 세팅

**목표**: 배포까지 연결된 뼈대 완성

**작업**:
- Vite + React + Tailwind 초기화
- `vite-plugin-pwa` 설치 + 기본 설정
- `public/manifest.json` 작성
- `430px max-width` 전역 레이아웃 컴포넌트 (`PageLayout`, `TopBar`, `BottomNav`)
- React Router v6 — 4개 빈 페이지 라우팅
- Supabase 클라이언트 (`src/lib/supabase.js`)
- `.env.local` + `.gitignore` 설정
- `vercel.json` SPA 리다이렉트 설정
- GitHub push → Vercel 연결 → 자동 배포 확인

**완료 기준**: Vercel URL에서 앱 로딩, 탭 네비게이션 동작, 빈 4개 페이지 라우팅 정상

---

### Session 2 — DB 스키마 + 인증

**목표**: Supabase 스키마 적용 + 로그인/회원가입 완성

**작업**:
- 마이그레이션 SQL 파일 작성 + Supabase에 적용
- `handle_new_user` 트리거 (회원가입 → profiles 자동 생성)
- `LoginForm`, `SignupForm` 컴포넌트
- `useAuth` 훅 (세션 감지, 로그인, 로그아웃, 회원가입)
- 로그인 상태 기반 라우트 가드
- `Auth.jsx` 페이지 조립

**완료 기준**: 회원가입 → 자동 로그인 → 홈 이동, 새로고침 후 세션 유지

---

### Session 3 — 관측 입력 UI

**목표**: 관측 입력 화면 전체 UI 완성 (DB 저장 제외)

**작업**:
- 공통 UI 컴포넌트 (`Button`, `Card`, `Spinner`, `Badge`)
- `DrynessSelector` — 4단계 카드형 선택 UI
- `WindSelector` — 6단계 선택 UI
- `LocationStatus` — GPS 상태 표시 (획득 중 / 완료 / 거부)
- `PhotoAttach` — 사진 선택 UI (파일 선택만, 업로드 로직 제외)
- `SubmitButton` — 상태별 처리 (비활성 / 로딩 / 완료)
- `Observe.jsx` 페이지 조립

**완료 기준**: 관측 입력 화면 완성, 단계 선택 인터랙션 동작 (저장 없이)

---

### Session 4 — 관측 제출 + 포인트

**목표**: 실제 데이터 저장 + 포인트 적립

**작업**:
- `useLocation` 훅 (GPS 획득, 5초 타임아웃, 거부 처리)
- Supabase Storage 버킷 생성 + 사진 업로드 로직
- `useObservation` 훅
  - `observations` insert
  - `point_logs` insert
  - `profiles.total_points` 업데이트
- Session 3 컴포넌트에 로직 연결
- 제출 성공/실패 피드백 UI

**완료 기준**: 관측 제출 → Supabase에 레코드 확인 → 포인트 반영 확인

---

### Session 5 — Kakao Maps + 정적 마커

**목표**: 지도 표시 + 관측 데이터 마커 렌더링

**작업**:
- `src/lib/kakao.js` — 동적 스크립트 로드 유틸
- `KakaoMap` 컴포넌트 (마운트/언마운트 생명주기 처리)
- 최근 24시간 `observations` 조회
- `RiskMarker` 컴포넌트 (위험 점수별 색상 커스텀 마커)
- `MapLegend` 컴포넌트
- 내 위치 중심 지도 초기화
- `Home.jsx` 페이지 조립

**완료 기준**: 지도 표시 + 기존 관측 데이터 마커 정상 렌더링

**Kakao 설정 주의**:
- Kakao Developers에서 JavaScript 앱 키 발급
- 허용 도메인에 `localhost:5173` + Vercel 도메인 등록
- 환경변수: `VITE_KAKAO_MAP_KEY`

---

### Session 6 — Realtime 구독

**목표**: 새 관측 등록 시 지도 자동 업데이트

**작업**:
- Supabase Realtime 채널 구독 (`observations` INSERT)
- 새 관측 마커 실시간 지도 추가
- 마커 클릭 시 관측 상세 말풍선 표시
- 구독 cleanup (컴포넌트 언마운트 시)

**완료 기준**: 별도 탭에서 관측 제출 → 지도에 마커 실시간 추가 확인

---

### Session 7 — 프로필 + 게이미피케이션

**목표**: 사용자 기여 현황 + 등급 시스템

**작업**:
- `useProfile` 훅 (프로필 조회, 닉네임 수정)
- `LevelBadge` 컴포넌트 — 등급 시각화
- `PointHistory` 컴포넌트 — 포인트 이력 목록
- `MyObservations` 컴포넌트 — 내 관측 이력
- 등급 체계:
  - 새싹 관찰자 (0~199pt)
  - 숲길 기록자 (200~499pt)
  - 바스락 마스터 (500~999pt)
  - 산봉감시 파수꾼 (1,000pt~)
- 최초 로그인 시 닉네임 설정 유도 (Modal)
- `Profile.jsx` 페이지 조립

**완료 기준**: 프로필 페이지에서 등급, 포인트, 관측 이력 확인 가능

---

## Kakao Maps 핵심 패턴

```js
// src/lib/kakao.js
export function loadKakaoMap() {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps) return resolve()
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_KEY}&autoload=false`
    script.onload = () => window.kakao.maps.load(resolve)
    script.onerror = reject
    document.head.appendChild(script)
  })
}
```

```jsx
// components/map/KakaoMap.jsx
import { useEffect, useRef } from 'react'
import { loadKakaoMap } from '@/lib/kakao'

export default function KakaoMap({ onMapReady }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    loadKakaoMap().then(() => {
      mapRef.current = new window.kakao.maps.Map(containerRef.current, {
        center: new window.kakao.maps.LatLng(36.5, 127.5),
        level: 8
      })
      onMapReady?.(mapRef.current)
    })
    // 언마운트 시 별도 cleanup 불필요 (kakao 인스턴스는 ref로 관리)
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
```

---

## 환경변수

```
# .env.local (절대 커밋 금지)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_KAKAO_MAP_KEY=발급받은_JavaScript_앱키
```

Vercel → Settings → Environment Variables 에 동일 등록.

---

## 작업 규칙 (Claude Code용)

1. **세션 시작 시** 이 문서 전체를 컨텍스트에 포함, 해당 세션 목표 먼저 확인

2. **마이그레이션 파일** 형식: `supabase/migrations/YYYYMMDD_NNN_설명.sql`

3. **Supabase 클라이언트** 초기화는 `src/lib/supabase.js` 하나에서만

4. **페이지 파일**은 컴포넌트 조합 + 훅 호출만 — 인라인 로직/스타일 금지

5. **환경변수 하드코딩 금지** — `.gitignore`에 `.env.local` 포함 확인

6. **Kakao Maps 인스턴스**는 `useRef`로 관리 — 리렌더링 시 재생성 방지

7. **세션 종료 전** 빌드 에러 없는 상태로 GitHub push + Vercel 배포 확인

---

## 참고: 바스락 지수 해상도 목표

| 참여자 수 | 평균 간격 | 스케일 |
|-----------|-----------|--------|
| 100명 | 약 32km | 시·도 수준 |
| 1,000명 | 약 10km | 생활권 수준 |
| 10,000명 | 약 3.2km | 마을 수준 |
| 100,000명 | 약 1km | 초고해상도 |
