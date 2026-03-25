-- point_logs INSERT 정책 누락 수정
create policy "로그인 사용자 포인트 이력 등록" on point_logs
  for insert with check (auth.uid() = user_id);
