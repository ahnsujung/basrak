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

    // CartoDB Positron — 흰 바탕에 지명만 표시되는 미니멀 스타일
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
    }).addTo(mapRef.current)

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
