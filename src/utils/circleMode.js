import L from 'leaflet'
import { getRiskColor } from './riskCalculator'

// 관측 수에 따른 영향권 반경 (미터)
// 0개: 50km, 50개: 30km, 99개: 10.4km
export const getInfluenceRadius = (totalCount) => {
  return Math.max(10000, 50000 - totalCount * 400)
}

// 관측 수에 따른 마커 반경 (픽셀)
export const getMarkerRadius = (totalCount) => {
  return Math.max(12, 28 - totalCount * 0.003)
}

// 영향권 원 레이어를 layerGroup에 추가
export const renderCircleMode = (layerGroup, observations, totalCount) => {
  const influenceRadius = getInfluenceRadius(totalCount)
  const markerRadius = getMarkerRadius(totalCount)

  observations.forEach((obs) => {
    const color = getRiskColor(obs.risk_score)
    const latlng = [obs.lat, obs.lng]

    // 영향권 원 (바깥쪽) — 테두리만, 채움 없음
    L.circle(latlng, {
      radius: influenceRadius,
      color: color,
      weight: 0.8,
      opacity: 0.25,
      fillColor: color,
      fillOpacity: 0.06,
      interactive: false,
    }).addTo(layerGroup)

    // 중간 원
    L.circle(latlng, {
      radius: influenceRadius * 0.45,
      color: color,
      weight: 0.5,
      opacity: 0.18,
      fillColor: color,
      fillOpacity: 0.08,
      interactive: false,
    }).addTo(layerGroup)

    // 마커 (중심) — 글로우 + 얇은 링 스타일
    const size = markerRadius * 2
    const icon = L.divIcon({
      className: '',
      html: `
        <div style="
          width:${size}px; height:${size}px;
          position:relative;
          display:flex; align-items:center; justify-content:center;
        ">
          <!-- 외곽 링 -->
          <div style="
            position:absolute;
            width:100%; height:100%;
            border-radius:50%;
            border:1px solid ${color};
            opacity:0.5;
          "></div>
          <!-- 중간 링 -->
          <div style="
            position:absolute;
            width:55%; height:55%;
            border-radius:50%;
            border:1.5px solid ${color};
            opacity:0.75;
          "></div>
          <!-- 중심 점 -->
          <div style="
            width:5px; height:5px;
            border-radius:50%;
            background:${color};
            box-shadow:0 0 6px 2px ${color};
          "></div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    })

    L.marker(latlng, { icon })
      .bindPopup(`
        <b>위험도: ${obs.risk_score}/10</b><br/>
        건조도: ${obs.dryness_level}단계<br/>
        풍속: ${obs.wind_level}단계<br/>
        ${new Date(obs.observed_at).toLocaleString('ko-KR')}
      `)
      .addTo(layerGroup)
  })
}
