import { useEffect, useRef } from 'react'
import L from 'leaflet'

// Leaflet 기본 마커 아이콘 경로 수정 (Vite 빌드 이슈)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})


export default function KakaoMap({ onMapReady, flyToRef }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  // 최초 1회 지도 초기화 — 항상 전국 뷰로 시작
  useEffect(() => {
    mapRef.current = L.map(containerRef.current, {
      center: [36.5, 127.5],
      zoom: 7,
      zoomControl: false,
    })

    // 시도 행정경계 GeoJSON — 도로 없는 미니멀 지도
    fetch('https://cdn.jsdelivr.net/gh/southkorea/southkorea-maps@master/kostat/2013/json/skorea_provinces_geo_simple.json')
      .then(r => r.json())
      .then(data => {
        if (!mapRef.current) return
        L.geoJSON(data, {
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
            })
          },
        }).addTo(mapRef.current)
      })

    // 줌 컨트롤 우측 하단
    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current)

    mapRef.current.invalidateSize()

    // flyToRef를 통해 외부에서 내 위치로 이동 가능하게
    if (flyToRef) {
      flyToRef.current = (coords) => {
        mapRef.current?.flyTo([coords.lat, coords.lng], 13, { duration: 1.2 })
      }
    }

    onMapReady?.(mapRef.current)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} className="absolute inset-0" />
}
