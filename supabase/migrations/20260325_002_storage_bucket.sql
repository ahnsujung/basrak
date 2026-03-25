-- Storage: 관측 사진 버킷
insert into storage.buckets (id, name, public)
values ('observation-photos', 'observation-photos', true)
on conflict do nothing;

create policy "관측 사진 공개 조회"
  on storage.objects for select
  using (bucket_id = 'observation-photos');

create policy "로그인 사용자 사진 업로드"
  on storage.objects for insert
  with check (
    bucket_id = 'observation-photos'
    and auth.uid() is not null
  );

create policy "본인 사진만 삭제 가능"
  on storage.objects for delete
  using (
    bucket_id = 'observation-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
