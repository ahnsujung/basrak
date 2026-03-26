-- Session 8: 희소 데이터 대응 지도 시각화
-- IDW 결과 캐싱 테이블

create table daily_maps (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  mode text not null check (mode in ('circles', 'heatmap')),
  observation_count integer not null,
  grid_data jsonb,        -- 히트맵 모드: [{lat, lng, intensity}]
  created_at timestamptz default now(),
  unique(date)
);

alter table daily_maps enable row level security;
create policy "전체 조회 가능" on daily_maps for select using (true);

-- 전체 관측 수 빠르게 조회하는 함수
create or replace function get_observation_count()
returns integer as $$
  select count(*)::integer from observations;
$$ language sql security definer;
