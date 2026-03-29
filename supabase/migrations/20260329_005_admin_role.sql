-- profiles 테이블에 role 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- role 체크용 함수 (SECURITY DEFINER로 RLS 재귀 방지)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 관리자만 전체 profiles 조회 가능
CREATE POLICY "admins can read all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- 관리자만 전체 observations 조회 가능
CREATE POLICY "admins can read all observations"
  ON observations FOR SELECT
  USING (is_admin());
