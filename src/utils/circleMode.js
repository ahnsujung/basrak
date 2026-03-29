import L from 'leaflet'
import { getRiskColor } from './riskCalculator'

// 줌 레벨별 영향권 반경 (미터)
export const getInfluenceRadius = (zoom) => {
  if (zoom <= 7) return 5000
  if (zoom <= 9) return 3000
  if (zoom <= 11) return 1500
  return 500
}

// 줌 레벨별 마커 크기 (픽셀)
export const getMarkerSize = (zoom) => {
  if (zoom <= 7) return 16
  if (zoom <= 9) return 20
  if (zoom <= 11) return 26
  return 32
}

// 개별 관측 마커 + 영향권 원 렌더링
export const renderCircleMode = (layerGroup, observations, zoom, onSelect) => {
  const influenceRadius = getInfluenceRadius(zoom)
  const size = getMarkerSize(zoom)

  observations.forEach((obs) => {
    const color = getRiskColor(obs.risk_score)
    const latlng = [obs.lat, obs.lng]

    // 영향권 원 (바깥쪽)
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

    // 마커 (중심)
    const icon = L.divIcon({
      className: '',
      html: `
        <div style="
          width:${size}px; height:${size}px;
          position:relative;
          display:flex; align-items:center; justify-content:center;
        ">
          <div style="
            position:absolute;
            width:100%; height:100%;
            border-radius:50%;
            border:1px solid ${color};
            opacity:0.5;
          "></div>
          <div style="
            position:absolute;
            width:55%; height:55%;
            border-radius:50%;
            border:1.5px solid ${color};
            opacity:0.75;
          "></div>
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
      .on('click', () => onSelect?.(obs))
      .addTo(layerGroup)
  })
}
