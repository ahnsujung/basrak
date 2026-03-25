import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { getVWorldTileUrl } from '@/lib/vworld'

// Leaflet 기본 마커 아이콘 경로 수정 (Vite 빌드 이슈)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function KakaoMap({ center, onMapReady }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const centerRef = useRef(center)
  useEffect(() => { centerRef.current = center }, [center])

  // 최초 1회 지도 초기화
  useEffect(() => {
    const c = centerRef.current ?? { lat: 36.5, lng: 127.5 }
    mapRef.current = L.map(containerRef.current, {
      center: [c.lat, c.lng],
      zoom: centerRef.current ? 13 : 7,
      zoomControl: false,
    })

    L.tileLayer(getVWorldTileUrl(), {
      maxZoom: 19,
      attribution: '© 국토지리정보원',
    }).addTo(mapRef.current)

    // 줌 컨트롤 우측 하단
    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current)

    onMapReady?.(mapRef.current)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // GPS 준비 후 지도 중심 이동
  useEffect(() => {
    if (!mapRef.current || !center) return
    mapRef.current.flyTo([center.lat, center.lng], 13, { duration: 1.2 })
  }, [center])

  return <div ref={containerRef} className="w-full h-full" />
}
