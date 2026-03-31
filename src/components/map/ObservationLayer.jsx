import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { getRiskColor } from '@/utils/riskCalculator'
import { getInfluenceRadius, getMarkerSize } from '@/utils/circleMode'

// 커스텀 클러스터링 — 픽셀 거리 기반 그룹핑
function clusterObservations(map, observations, radius = 20) {
  const zoom = map.getZoom()
  const clusters = []
  const used = new Set()

  observations.forEach((obs, i) => {
    if (used.has(i)) return

    const pixel = map.project([obs.lat, obs.lng], zoom)
    const members = [obs]
    used.add(i)

    observations.forEach((other, j) => {
      if (used.has(j)) return
      const otherPixel = map.project([other.lat, other.lng], zoom)
      if (pixel.distanceTo(otherPixel) <= radius) {
        members.push(other)
        used.add(j)
      }
    })

    const centerLat = members.reduce((s, m) => s + m.lat, 0) / members.length
    const centerLng = members.reduce((s, m) => s + m.lng, 0) / members.length
    const avgRisk = Math.round(members.reduce((s, m) => s + m.risk_score, 0) / members.length)
    const center = L.latLng(centerLat, centerLng)
    const maxDist = Math.max(...members.map(m => center.distanceTo(L.latLng(m.lat, m.lng))))

    clusters.push({ center: [centerLat, centerLng], members, count: members.length, avgRisk, maxDist })
  })

  return clusters
}

// 클러스터 도트 사이즈 (건수 기준)
function getClusterDotSize(count) {
  if (count <= 3) return 6
  if (count <= 10) return 12
  if (count <= 20) return 18
  return 26
}

// 클러스터 모드 렌더링 (줌 7~10)
function renderClusters(layerGroup, map, observations, onSelect) {
  const clusters = clusterObservations(map, observations)

  clusters.forEach(({ center, members, count, avgRisk, maxDist }) => {
    const color = getRiskColor(avgRisk)
    const isSingle = count === 1

    // 영향권 반경: 단독=10km, 클러스터=최원점+10km
    const influenceRadius = isSingle ? 10000 : maxDist + 10000

    // 바깥 영향권 원
    L.circle(center, {
      radius: influenceRadius,
      color,
      weight: 0.8,
      opacity: 0.2,
      fillColor: color,
      fillOpacity: 0.06,
      interactive: false,
    }).addTo(layerGroup)

    // 안쪽 원
    L.circle(center, {
      radius: influenceRadius * 0.45,
      color,
      weight: 0.5,
      opacity: 0.15,
      fillColor: color,
      fillOpacity: 0.08,
      interactive: false,
    }).addTo(layerGroup)

    // 도트
    const dotSize = isSingle ? 8 : getClusterDotSize(count)
    const dotIcon = L.divIcon({
      className: '',
      html: `<div style="
        width:${dotSize}px; height:${dotSize}px;
        border-radius:50%;
        background:${color};
        box-shadow:0 0 6px 2px ${color};
      "></div>`,
      iconSize: [dotSize, dotSize],
      iconAnchor: [dotSize / 2, dotSize / 2],
    })

    L.marker(center, { icon: dotIcon })
      .on('click', () => onSelect?.(members.length > 1 ? members : members[0]))
      .addTo(layerGroup)

    // 펄스
    const pulseSize = dotSize * 1.5
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
    L.marker(center, { icon: pulseIcon, interactive: false }).addTo(layerGroup)
  })
}

// 개별 마커 모드 렌더링 (줌 11+)
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

    // 마커 도트 (동심원)
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

      if (zoom <= 10) {
        renderClusters(layerGroupRef.current, map, observations, onSelect)
      } else {
        renderMarkers(layerGroupRef.current, observations, zoom, onSelect)
      }
    }

    render()
    map.on('zoomend', render)

    return () => {
      map.off('zoomend', render)
    }
  }, [map, observations, totalCount]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
