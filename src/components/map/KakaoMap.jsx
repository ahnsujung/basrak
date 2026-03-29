import { useEffect, useRef } from 'react'
import L from 'leaflet'

// Leaflet 기본 마커 아이콘 경로 수정 (Vite 빌드 이슈)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})


export default function KakaoMap({ onMapReady, coords }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const myLocMarkerRef = useRef(null)

  // 최초 1회 지도 초기화 — 항상 전국 뷰로 시작
  useEffect(() => {
    const southKoreaBounds = L.latLngBounds([28.0, 124.5], [42.0, 132.0])

    mapRef.current = L.map(containerRef.current, {
      center: [35.8, 127.7],
      zoom: 7,
      zoomControl: false,
      maxBounds: southKoreaBounds,
      maxBoundsViscosity: 1.0,
      minZoom: 7,
      maxZoom: 18,
      attributionControl: false,
      renderer: L.svg({ padding: 2.0 }),
    })

    // GeoJSON을 마커 아래에 그리기 위한 커스텀 pane
    mapRef.current.createPane('base')
    mapRef.current.getPane('base').style.zIndex = 200

    // 시도 행정경계 GeoJSON — 도로 없는 미니멀 지도
    fetch('https://cdn.jsdelivr.net/gh/southkorea/southkorea-maps@master/kostat/2013/json/skorea_provinces_geo_simple.json')
      .then(r => r.json())
      .then(data => {
        if (!mapRef.current) return
        L.geoJSON(data, {
          pane: 'base',
          interactive: false,
          style: {
            color: '#94a3b8',
            weight: 1,
            fillColor: '#f8fafc',
            fillOpacity: 1,
          },
          onEachFeature: (feature, layer) => {
            layer.bindTooltip(feature.properties.name, {
              permanent: true,
              direction: 'center',
              className: 'province-label',
              pane: 'tooltipPane',
            })
          },
        }).addTo(mapRef.current)
      })


    mapRef.current.invalidateSize()
    onMapReady?.(mapRef.current)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 내 위치 파란 점 마커 — 줌 레벨별 크기 조절
  useEffect(() => {
    const map = mapRef.current
    if (!map || !coords) return

    function makeIcon(zoom) {
      // 줌 7: 20px, 줌 10: 28px, 줌 13: 36px
      const size = Math.round(Math.min(Math.max(14 + (zoom - 7) * 3, 14), 40))
      const border = zoom >= 10 ? 3 : 2
      return L.divIcon({
        className: 'my-loc-marker',
        html: `<div class="my-loc-pulse-ring"></div><div class="my-loc-dot" style="width:${size}px;height:${size}px;border-width:${border}px;"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      })
    }

    // 기존 마커 제거 후 새로 생성 (effect 재실행 시 꼬임 방지)
    if (myLocMarkerRef.current) {
      myLocMarkerRef.current.remove()
      myLocMarkerRef.current = null
    }

    const icon = makeIcon(map.getZoom())
    myLocMarkerRef.current = L.marker([coords.lat, coords.lng], { icon, zIndexOffset: 1000, interactive: false })
      .addTo(map)

    function onZoom() {
      if (!myLocMarkerRef.current) return
      myLocMarkerRef.current.setIcon(makeIcon(map.getZoom()))
    }

    map.on('zoomend', onZoom)
    return () => {
      map.off('zoomend', onZoom)
    }
  }, [coords])

  return <div ref={containerRef} className="absolute inset-0 z-0" />
}
