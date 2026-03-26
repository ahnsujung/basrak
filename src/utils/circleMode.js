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

    // 영향권 원 (바깥쪽, 반투명)
    L.circle(latlng, {
      radius: influenceRadius,
      color: 'transparent',
      fillColor: color,
      fillOpacity: 0.18,
      interactive: false,
    }).addTo(layerGroup)

    // 중간 원 (그라데이션 느낌)
    L.circle(latlng, {
      radius: influenceRadius * 0.5,
      color: 'transparent',
      fillColor: color,
      fillOpacity: 0.12,
      interactive: false,
    }).addTo(layerGroup)

    // 마커 (중심)
    L.circleMarker(latlng, {
      radius: markerRadius,
      color: '#fff',
      weight: 2,
      fillColor: color,
      fillOpacity: 0.9,
    })
      .bindPopup(`
        <b>위험도: ${obs.risk_score}/10</b><br/>
        건조도: ${obs.dryness_level}단계<br/>
        풍속: ${obs.wind_level}단계<br/>
        ${new Date(obs.observed_at).toLocaleString('ko-KR')}
      `)
      .addTo(layerGroup)
  })
}
