-- observations 공개 SELECT 정책 재확인
-- 005에서 admin 전용 정책 추가 시 기존 public 정책이 삭제됐을 수 있음
DROP POLICY IF EXISTS "관측 전체 조회 가능" ON observations;
CREATE POLICY "관측 전체 조회 가능" ON observations
  FOR SELECT USING (true);
