import { useEffect, useRef } from 'react'
import { loadKakaoMap } from '@/lib/kakao'

export default function KakaoMap({ center, onMapReady }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  // 최신 center 값을 ref로 유지 — 지도 로딩 완료 시점에 GPS가 이미 준비됐을 수 있음
  const centerRef = useRef(center)
  useEffect(() => { centerRef.current = center }, [center])

  // 최초 1회 지도 초기화
  useEffect(() => {
    loadKakaoMap().then(() => {
      const c = centerRef.current ?? { lat: 36.5, lng: 127.5 }
      mapRef.current = new window.kakao.maps.Map(containerRef.current, {
        center: new window.kakao.maps.LatLng(c.lat, c.lng),
        level: centerRef.current ? 5 : 8,
      })
      onMapReady?.(mapRef.current)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // GPS 준비 후 지도 중심 이동
  useEffect(() => {
    if (!mapRef.current || !center) return
    mapRef.current.panTo(new window.kakao.maps.LatLng(center.lat, center.lng))
    mapRef.current.setLevel(5)
  }, [center])

  return <div ref={containerRef} className="w-full h-full" />
}
