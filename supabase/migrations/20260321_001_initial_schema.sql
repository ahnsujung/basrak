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
