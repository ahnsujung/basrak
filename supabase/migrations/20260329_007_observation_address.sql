-- 관측에 역지오코딩 주소 저장
ALTER TABLE observations ADD COLUMN IF NOT EXISTS address text;
