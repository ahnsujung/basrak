import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { getRiskColor } from '@/utils/riskCalculator'
import { getInfluenceRadius, getMarkerSize } from '@/utils/circleMode'

// 개별 관측 마커 + 영향권 원 렌더링 (모든 줌 레벨)
function renderMarkers(layerGroup, observations, zoom, onSelect) {
  const influenceRadius = getInfluenceRadius(zoom)
  const size = getMarkerSize(zoom)

  observations.forEach((obs) => {
    const color = getRiskColor(obs.risk_score)
    const latlng = [obs.lat, obs.lng]

    // 영향권 원 (바깥)
    L.circle(latlng, {
      radius: influenceRadius,
      color,
      weight: 0.8,
      opacity: 0.25,
      fillColor: color,
      fillOpacity: 0.06,
      interactive: false,
    }).addTo(layerGroup)

    // 영향권 원 (안쪽)
    L.circle(latlng, {
      radius: influenceRadius * 0.45,
      color,
      weight: 0.5,
      opacity: 0.18,
      fillColor: color,
      fillOpacity: 0.08,
      interactive: false,
    }).addTo(layerGroup)

    // 마커 도트
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
      .on('click', () => {
        const threshold = 0.5 / Math.pow(2, zoom - 7)
        const nearby = observations.filter(o =>
          Math.abs(o.lat - obs.lat) < threshold && Math.abs(o.lng - obs.lng) < threshold
        )
        onSelect?.(nearby.length > 1 ? nearby : obs)
      })
      .addTo(layerGroup)

    // 펄스 (줌 아웃에서만)
    if (zoom < 11) {
      const pulseSize = size * 1.2
      const pulseIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:${pulseSize}px; height:${pulseSize}px;
          border-radius:50%;
          background:${color};
          opacity:0.3;
          animation:cluster-pulse 2s ease-out infinite;
        "></div>`,
        iconSize: [pulseSize, pulseSize],
        iconAnchor: [pulseSize / 2, pulseSize / 2],
      })
      L.marker(latlng, { icon: pulseIcon, interactive: false }).addTo(layerGroup)
    }
  })
}

export default function ObservationLayer({ map, observations, totalCount, onSelect }) {
  const layerGroupRef = useRef(null)

  useEffect(() => {
    if (!map) return

    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup().addTo(map)
    }

    return () => {
      layerGroupRef.current?.remove()
      layerGroupRef.current = null
    }
  }, [map])

  useEffect(() => {
    if (!map || !layerGroupRef.current) return

    const render = () => {
      layerGroupRef.current.clearLayers()
      const zoom = map.getZoom()
      renderMarkers(layerGroupRef.current, observations, zoom, onSelect)
    }

    render()
    map.on('zoomend', render)

    return () => {
      map.off('zoomend', render)
    }
  }, [map, observations, totalCount]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
