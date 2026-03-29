# 카카오 로그인 연동 가이드

## 1. 카카오 개발자 계정 등록

1. https://developers.kakao.com 접속
2. 카카오 계정으로 로그인
3. 상단 **"시작하기"** 클릭
4. 개발자 동의 후 등록 완료 (즉시 승인, 심사 없음)

## 2. 앱 생성

1. **내 애플리케이션** → **애플리케이션 추가하기**
2. 앱 정보 입력:
   - 앱 이름: `바스락`
   - 사업자명: 개인 이름 입력
3. 저장

## 3. 카카오 로그인 활성화

1. 생성된 앱 클릭 → **카카오 로그인** 메뉴
2. **활성화 설정**: ON
3. **Redirect URI** 추가:
   ```
   https://ydqmiwxwbilfgwpriosd.supabase.co/auth/v1/callback
   ```

## 4. 동의 항목 설정

1. **카카오 로그인** → **동의항목**
2. 필수 항목 설정:
   - 닉네임: 필수
   - 이메일: 필수 (선택 동의로 해도 됨)

## 5. 키 확인

1. **앱 설정** → **앱 키** 메뉴
2. 필요한 값:
   - **REST API 키** → Supabase Client ID에 입력
3. **앱 설정** → **보안** 메뉴
4. **Client Secret** 생성 → 코드 복사

## 6. Supabase 설정

1. Supabase 대시보드 → **Authentication** → **Providers**
2. **Kakao** 선택 → Enable
3. 입력:
   - **Client ID**: REST API 키
   - **Client Secret**: 위에서 생성한 값
4. 저장

## 7. 코드 적용 (개발자가 할 일)

로그인 페이지에 카카오 버튼 추가:

```js
const handleKakaoLogin = () => {
  supabase.auth.signInWithOAuth({ provider: 'kakao' })
}
```

---

## 추가 작업: 카카오 로컬 API (역지오코딩)

카카오 앱 생성하면 로컬 API도 함께 사용 가능 (REST API 키 동일)

### 용도
- 관측 제출 시 좌표 → 시군구 변환하여 DB 저장
- 내 관찰 목록에 지역명 표시

### 필요한 코드 작업 (개발자가 할 일)
1. observations 테이블에 `address` 컬럼 추가
2. 관측 제출 시 카카오 역지오코딩 API 호출 → 시군구 저장
3. 내 관찰 목록에서 address 표시

---

## 체크리스트

- [ ] 카카오 개발자 계정 등록
- [ ] 앱 생성
- [ ] 카카오 로그인 활성화 + Redirect URI
- [ ] 동의항목 설정
- [ ] REST API 키 + Client Secret 확인
- [ ] Supabase Kakao Provider 설정
- [ ] 카카오 로그인 코드 적용 및 테스트
- [ ] 역지오코딩 (시군구) 적용 및 테스트
