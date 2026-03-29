import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { getRiskColor } from '@/utils/riskCalculator'
import { getInfluenceRadius, getMarkerSize } from '@/utils/circleMode'

/* 히트맵 모드 — 줌 레벨별 전환 구현 후 활성화
import 'leaflet.heat'
import { supabase } from '@/lib/supabase'
import { risk } from '@/constants/theme'

function useHeatmapGrid() { ... }
function renderHeatmap() { ... }
*/

// 클러스터 아이콘: 투명 (도트는 addClusterCircles에서 반경 비율로 생성)
function createClusterIcon(cluster) {
  return L.divIcon({
    className: '',
    html: '',
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  })
}

function renderMarkers(layerGroup, observations, zoom, onSelect) {
  const influenceRadius = getInfluenceRadius(zoom)
  const size = getMarkerSize(zoom)

  observations.forEach((obs) => {
    const color = getRiskColor(obs.risk_score)
    const latlng = [obs.lat, obs.lng]

    // 영향권 원
    L.circle(latlng, {
      radius: influenceRadius,
      color: color,
      weight: 0.8,
      opacity: 0.25,
      fillColor: color,
      fillOpacity: 0.06,
      interactive: false,
    }).addTo(layerGroup)

    L.circle(latlng, {
      radius: influenceRadius * 0.45,
      color: color,
      weight: 0.5,
      opacity: 0.18,
      fillColor: color,
      fillOpacity: 0.08,
      interactive: false,
    }).addTo(layerGroup)

    // 마커
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

    const marker = L.marker(latlng, { icon, riskScore: obs.risk_score })
      .on('click', () => {
        const threshold = 0.5 / Math.pow(2, zoom - 7)
        const nearby = observations.filter(o =>
          Math.abs(o.lat - obs.lat) < threshold && Math.abs(o.lng - obs.lng) < threshold
        )
        onSelect?.(nearby.length > 1 ? nearby : obs)
      })

    marker.addTo(layerGroup)
  })
}

export default function ObservationLayer({ map, observations, totalCount, onSelect }) {
  const layerGroupRef = useRef(null)
  const clusterGroupRef = useRef(null)

  useEffect(() => {
    if (!map) return

    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup().addTo(map)
    }

    if (!clusterGroupRef.current) {
      clusterGroupRef.current = L.markerClusterGroup({
        maxClusterRadius: 20,
        disableClusteringAtZoom: 11,
        spiderfyOnMaxZoom: false,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: false,
        iconCreateFunction: createClusterIcon,
        animate: false,
      }).addTo(map)

      clusterGroupRef.current.on('clusterclick', (e) => {
        const children = e.layer.getAllChildMarkers()
        const obs = children.map(m => m.options.obsData).filter(Boolean)
        if (obs.length > 0) onSelect?.(obs.length > 1 ? obs : obs[0])
      })
    }

    return () => {
      layerGroupRef.current?.remove()
      layerGroupRef.current = null
      clusterGroupRef.current?.remove()
      clusterGroupRef.current = null
    }
  }, [map])

  // 관측 데이터 변경 시 렌더링
  useEffect(() => {
    if (!map || !layerGroupRef.current || !clusterGroupRef.current) return

    const render = () => {
      const zoom = map.getZoom()
      layerGroupRef.current.clearLayers()
      clusterGroupRef.current.clearLayers()

      if (zoom >= 11) {
        // 줌 인: 개별 마커 + 영향권 원
        renderMarkers(layerGroupRef.current, observations, zoom, onSelect)
      } else {
        // 줌 아웃: 클러스터
        observations.forEach((obs) => {
          const color = getRiskColor(obs.risk_score)
          const icon = L.divIcon({
            className: '',
            html: `<div style="
              width:10px; height:10px;
              border-radius:50%;
              background:${color};
              border:2px solid white;
              box-shadow:0 0 4px ${color}80;
            "></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          })

          const marker = L.marker([obs.lat, obs.lng], { icon, riskScore: obs.risk_score, obsData: obs })
            .on('click', () => {
              const threshold = 0.5 / Math.pow(2, zoom - 7)
              const nearby = observations.filter(o =>
                Math.abs(o.lat - obs.lat) < threshold && Math.abs(o.lng - obs.lng) < threshold
              )
              onSelect?.(nearby.length > 1 ? nearby : obs)
            })

          clusterGroupRef.current.addLayer(marker)
        })

        // 클러스터별 영향권 원 추가
        const addClusterCircles = () => {
          // 기존 클러스터 원 제거
          layerGroupRef.current.clearLayers()

          clusterGroupRef.current.eachLayer(() => {}) // force cluster calculation
          const visibleClusters = []
          const singleMarkers = []
          clusterGroupRef.current._featureGroup.eachLayer((layer) => {
            if (layer._childCount) visibleClusters.push(layer)
            else if (layer.getLatLng) singleMarkers.push(layer)
          })
          console.log(`줌${map.getZoom()}: 클러스터 ${visibleClusters.length}개, 단독 ${singleMarkers.length}개`)

          visibleClusters.forEach((cluster) => {
            const children = cluster.getAllChildMarkers()
            const scores = children.map(m => m.options.riskScore).filter(Boolean)
            const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 3
            const color = getRiskColor(Math.round(avg))

            // 관측점들의 실제 중심 계산
            const lats = children.map(c => c.getLatLng().lat)
            const lngs = children.map(c => c.getLatLng().lng)
            const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length
            const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length
            const center = L.latLng(centerLat, centerLng)

            // 중심에서 가장 먼 점까지의 거리 (미터) + 5km
            let maxDist = 0
            children.forEach((child) => {
              const d = center.distanceTo(child.getLatLng())
              if (d > maxDist) maxDist = d
            })
            const radius = maxDist + 10000

            L.circle([center.lat, center.lng], {
              radius,
              color: color,
              weight: 0.8,
              opacity: 0.2,
              fillColor: color,
              fillOpacity: 0.06,
              interactive: false,
            }).addTo(layerGroupRef.current)

            L.circle([center.lat, center.lng], {
              radius: radius * 0.45,
              color: color,
              weight: 0.5,
              opacity: 0.15,
              fillColor: color,
              fillOpacity: 0.08,
              interactive: false,
            }).addTo(layerGroupRef.current)

            // 건수 기준 중심 도트
            const count = children.length
            const dotSize = count <= 3 ? 6 : count <= 10 ? 12 : count <= 20 ? 18 : 26
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
            L.marker([center.lat, center.lng], { icon: dotIcon })
              .on('click', () => {
                const obs = children.map(m => m.options.obsData).filter(Boolean)
                if (obs.length > 0) onSelect?.(obs.length > 1 ? obs : obs[0])
              })
              .addTo(layerGroupRef.current)

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
            L.marker([center.lat, center.lng], { icon: pulseIcon, interactive: false })
              .addTo(layerGroupRef.current)
          })

          // 단독 마커에도 영향권 원 + 도트 + 펄스
          singleMarkers.forEach((marker) => {
            const obs = marker.options?.obsData ?? marker.options?._origData
            if (!obs) {
              // fallback: 위치에서 가장 가까운 관측 찾기
              const ll = marker.getLatLng()
              const nearest = observations.find(o =>
                Math.abs(o.lat - ll.lat) < 0.001 && Math.abs(o.lng - ll.lng) < 0.001
              )
              if (!nearest) return
              var obsData = nearest
            } else {
              var obsData = obs
            }
            const color = getRiskColor(obsData.risk_score)
            const latlng = [obsData.lat, obsData.lng]
            const singleRadius = 10000

            L.circle(latlng, {
              radius: singleRadius,
              color: color,
              weight: 0.8,
              opacity: 0.2,
              fillColor: color,
              fillOpacity: 0.06,
              interactive: false,
            }).addTo(layerGroupRef.current)

            L.circle(latlng, {
              radius: singleRadius * 0.45,
              color: color,
              weight: 0.5,
              opacity: 0.15,
              fillColor: color,
              fillOpacity: 0.08,
              interactive: false,
            }).addTo(layerGroupRef.current)

            const sDot = 8
            const sDotIcon = L.divIcon({
              className: '',
              html: `<div style="
                width:${sDot}px; height:${sDot}px;
                border-radius:50%;
                background:${color};
                box-shadow:0 0 6px 2px ${color};
              "></div>`,
              iconSize: [sDot, sDot],
              iconAnchor: [sDot / 2, sDot / 2],
            })
            L.marker(latlng, { icon: sDotIcon })
              .on('click', () => onSelect?.(obsData))
              .addTo(layerGroupRef.current)

            const sPulse = sDot * 1.5
            const sPulseIcon = L.divIcon({
              className: '',
              html: `<div style="
                width:${sPulse}px; height:${sPulse}px;
                border-radius:50%;
                background:${color};
                opacity:0.3;
                animation:cluster-pulse 2s ease-out infinite;
              "></div>`,
              iconSize: [sPulse, sPulse],
              iconAnchor: [sPulse / 2, sPulse / 2],
            })
            L.marker(latlng, { icon: sPulseIcon, interactive: false })
              .addTo(layerGroupRef.current)
          })
        }

        // 클러스터 형성 후 원 그리기
        clusterGroupRef.current.on('animationend', addClusterCircles)
        setTimeout(addClusterCircles, 300)
      }
    }

    render()
    map.on('zoomend', render)

    return () => {
      map.off('zoomend', render)
      clusterGroupRef.current?.off('animationend')
    }
  }, [map, observations, totalCount]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
