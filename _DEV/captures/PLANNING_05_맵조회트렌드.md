# 지난날 맵 조회 및 트렌드
> 바스락 기획 구현 가이드 · 항목 5

---

## 배경

단순 실시간 지도가 아닌 일간 스냅샷 아카이브를 제공해
트렌드 파악과 연구 활용이 가능하게 한다.

---

## 5-1. report_date 컬럼 (스키마)

관측 창(11–13시) 내 제출만 공식 집계에 포함된다.

```sql
alter table observations
  add column report_date date generated always as (
    case
      when (observed_at at time zone 'Asia/Seoul')::time
           between '11:00' and '13:00'
        then (observed_at at time zone 'Asia/Seoul')::date
      else null
    end
  ) stored;

create index idx_observations_report_date
  on observations (report_date)
  where report_date is not null;
```

- `report_date is null` → 트랙 B 관측 (연구용 보관, 공식 집계 제외)
- `report_date is not null` → 트랙 A 공식 관측

---

## 5-2. 일간 리포트 집계 테이블 (daily_reports)

```sql
create table daily_reports (
  report_date date primary key,
  observation_count integer not null default 0,
  avg_risk_score numeric(4,2),
  finalized_at timestamptz,
  created_at timestamptz default now()
);
```

- 매일 14:00에 집계 후 `finalized_at` 기록
- MVP 단계: 수동 insert 또는 Supabase Edge Function으로 자동화

---

## 5-3. 달력 아카이브 UI (ReportCalendar)

지난 30일을 달력으로 표시.
각 날짜 셀 배경색 = 그날 `avg_risk_score` 기준 위험도 색상 (히트맵).
날짜 클릭 시 해당 날의 관측 지도 + "○월 ○일 리포트 · ○건 관측" 표시.
데이터 없는 날(관측 0건)은 회색 처리.

**구현 위치**: `components/map/ReportCalendar.jsx`  
**데이터 출처**: `daily_reports` 최근 30일 조회

```js
// 위험도 색상은 기존 getRiskColor 재사용
import { getRiskColor } from '@/utils/riskCalculator'
```

---

## 5-4. 내 지역 7일 트렌드 (RegionTrend)

홈 또는 프로필 하단에 위치.
내 최근 관측 위치 기준 격자의 최근 7일 위험도 추이 막대 그래프.
오늘 집계 전이면 마지막 막대를 점선으로 표시.

```
이번 주 내 지역
월  화  수  목  금  토  오늘
🟢  🟡  🟠  🟠  🟢  🟡  ░░░
```

**구현 위치**: `components/profile/RegionTrend.jsx`  
**데이터 출처**: `observations`에서 내 격자 기준 지난 7일 `report_date`별 avg 집계

---

## 페이지별 배치

| 기능 | 배치 위치 |
|------|---------|
| `ReportCalendar` | Home 페이지 하단 또는 별도 탭 |
| `RegionTrend` | Profile 페이지 상단 요약 영역 |
