-- 공지사항 테이블
CREATE TABLE notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- 전체 공개 조회
CREATE POLICY "notices are public" ON notices
  FOR SELECT USING (true);

-- 관리자만 작성/수정/삭제
CREATE POLICY "admins can manage notices" ON notices
  FOR ALL USING (is_admin());
