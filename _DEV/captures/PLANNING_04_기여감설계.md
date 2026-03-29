# 도시 참여자 기여감 설계
> 바스락 기획 구현 가이드 · 항목 4

---

## 배경

도시에 관측자가 많으면 내 마커가 클러스터에 묻혀 기여감이 사라진다.
기여감을 지도 마커 외의 방식으로 별도 제공해야 한다.

---

## 4-1. 해상도 기여 수치 (ContributionBadge)

내 관측이 속한 격자(grid cell)의 오늘 전체 관측 건수 대비 내 기여 비율 표시.
신뢰도(관측 건수 기반 0–100%) 함께 표시.

```
오늘 강남구 관측 47건
당신의 기여도: 2.1%
신뢰도: ████████░░ 83%
```

**구현 위치**: `components/profile/ContributionBadge.jsx`  
**데이터 출처**: `observations` 테이블에서 당일 `report_date` + 동일 격자 관측 건수 집계

격자 단위는 위도·경도 0.1도(약 10km) 기준으로 시작. 참여자 증가 후 축소 가능.

```js
// utils/grid.js
export const getGridKey = (lat, lng) => {
  const gridLat = Math.floor(lat * 10) / 10
  const gridLng = Math.floor(lng * 10) / 10
  return `${gridLat}_${gridLng}`
}
```

---

## 4-2. 내 관측 영향 반경 표시 (MyImpactCircle)

내 최근 관측 지점 중심으로 반경 500m 원을 지도에 오버레이.
"이 원 안의 위험도 판단에 내 관측이 쓰였습니다" 툴팁 표시.
지도 레이어 토글로 on/off 가능.

**구현 위치**: `components/map/MyImpactCircle.jsx`  
**Leaflet API**: `L.circle(latlng, { radius: 500 })`  
**표시 조건**: 로그인 상태 + 당일 관측 완료한 경우에만 렌더링

---

## 4-3. 관측 공백 알림 (GapAlert)

현재 GPS 위치 주변 300m 이내에 오늘 관측이 없는 구역이 있으면 배너로 알림.
관측 창(11–13시) 진입 시에만 표시.

```
📍 지금 위치에서 300m 안에
오늘 관측이 없는 구역이 있어요
```

**구현 위치**: `components/observation/GapAlert.jsx`  
**데이터 출처**: `observations`에서 오늘 `report_date` + 현재 위치 반경 300m 내 건수 조회

```js
// hooks/useNearbyGap.js
// 현재 위치 기준 반경 내 오늘 관측 건수 조회
// 0건이면 gap = true 반환
```

---

## 4-4. 내 지도 뷰 (MyMapView)

Profile 페이지 내 탭: "내 지도".
내가 관측한 지점만 지도에 마커로 표시 (전체 기간).
마커 클릭 시 날짜·위험도·기여 수치 말풍선 표시.
지도 외 목록 뷰도 함께 제공 (날짜 내림차순).

**구현 위치**: `components/profile/MyMapView.jsx`  
**데이터 출처**: `observations` where `user_id = auth.uid()`

---

## 컴포넌트 요약

| 컴포넌트 | 위치 | 표시 조건 |
|---------|------|---------|
| `ContributionBadge` | `components/profile/` | 당일 관측 완료 후 |
| `MyImpactCircle` | `components/map/` | 로그인 + 당일 관측 완료 |
| `GapAlert` | `components/observation/` | 관측 창 시간 + 주변 공백 있을 때 |
| `MyMapView` | `components/profile/` | 로그인 상태 항상 |
