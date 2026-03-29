# Cloudflare R2 스토리지 전환 가이드

## 왜 R2로 전환하나?
- Supabase Storage 무료: 1GB / 이그레스 2GB/월
- Cloudflare R2 무료: **10GB** / 이그레스 **무제한 무료**
- 사진이 쌓이면 Supabase 용량 부족 → R2가 장기적으로 유리

## 1. Cloudflare 계정 가입

1. https://dash.cloudflare.com/sign-up 접속
2. 와이프 이메일로 가입 (무료)
3. 이메일 인증 완료

## 2. R2 활성화

1. Cloudflare 대시보드 좌측 메뉴 → **R2 Object Storage**
2. 최초 진입 시 결제 정보 입력 필요 (무료 플랜이지만 카드 등록 필수)
3. 무료 한도: 10GB 저장 / 월 1,000만 읽기 / 월 100만 쓰기

## 3. 버킷 생성

1. R2 → **Create bucket**
2. 버킷 이름: `basrak-photos`
3. 리전: **Asia Pacific (APAC)** 선택

## 4. 공개 액세스 설정

1. 생성된 버킷 → **Settings**
2. **Public access** → 커스텀 도메인 연결 또는 R2.dev 서브도메인 활성화
3. R2.dev 서브도메인 활성화하면 `https://pub-xxxx.r2.dev/` 형태로 공개 접근 가능

## 5. API 토큰 생성

1. R2 → **Manage R2 API Tokens**
2. **Create API token**
3. 권한: **Object Read & Write**
4. 특정 버킷: `basrak-photos`
5. 생성 후 저장할 값:
   - **Access Key ID**
   - **Secret Access Key**
   - **Endpoint**: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

## 6. Worker 생성 (업로드 프록시)

1. Cloudflare 대시보드 → **Workers & Pages**
2. **Create Worker** → 이름: `basrak-upload`
3. 코드는 개발자가 작성 (presigned URL 발급 또는 직접 업로드 프록시)

## 7. 환경변수 (개발자가 설정)

```
VITE_R2_PUBLIC_URL=https://pub-xxxx.r2.dev
```

Worker 측:
```
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_ENDPOINT=
R2_BUCKET=basrak-photos
```

## 8. 코드 전환 (개발자가 할 일)

- `useObservation.js` 업로드 경로를 R2 Worker로 변경
- `photo_url` 저장 시 R2 공개 URL 사용
- 기존 Supabase Storage 사진은 그대로 유지 (URL 유효)

---

## 체크리스트

- [ ] Cloudflare 계정 가입
- [ ] R2 활성화 + 카드 등록
- [ ] `basrak-photos` 버킷 생성
- [ ] 공개 액세스 설정
- [ ] API 토큰 생성
- [ ] Worker 생성
- [ ] 코드 전환 및 테스트
