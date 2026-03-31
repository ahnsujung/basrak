-- app_config 테이블 (대시보드에서 수동 생성된 경우 무시)
CREATE TABLE IF NOT EXISTS app_config (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT ''
);

-- RLS 활성화
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- 전체 조회 가능 (앱에서 설정값 읽기)
DROP POLICY IF EXISTS "app_config_select" ON app_config;
CREATE POLICY "app_config_select" ON app_config
  FOR SELECT USING (true);

-- 관리자만 수정 가능
DROP POLICY IF EXISTS "app_config_admin_write" ON app_config;
CREATE POLICY "app_config_admin_write" ON app_config
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
