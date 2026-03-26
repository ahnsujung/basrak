import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { getVWorldTileUrl } from '@/lib/vworld'
import { getRiskColor } from '@/utils/riskCalculator'

// Leaflet 기본 마커 아이콘 경로 수정
delete L.Icon.Default.prototype._getIconUrl

const COUNTS = [10, 100, 1000, 10000]

// 대한민국 경계 (제주 포함)
const KOREA_BOUNDS = {
  latMin: 33.1, latMax: 38.6,
  lngMin: 125.1, lngMax: 129.6,
}

function randomObs(id) {
  const dryness = Math.ceil(Math.random() * 5)
  const wind = Math.ceil(Math.random() * 5)
  return {
    id,
    lat: KOREA_BOUNDS.latMin + Math.random() * (KOREA_BOUNDS.latMax - KOREA_BOUNDS.latMin),
    lng: KOREA_BOUNDS.lngMin + Math.random() * (KOREA_BOUNDS.lngMax - KOREA_BOUNDS.lngMin),
    risk_score: dryness + wind,
  }
}

function generatePoints(count) {
  return Array.from({ length: count }, (_, i) => randomObs(i))
}

export default function MapTest() {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  const [count, setCount] = useState(100)
  const [stats, setStats] = useState(null)
  const [ready, setReady] = useState(false)

  // 지도 초기화 (1회)
  useEffect(() => {
    mapRef.current = L.map(containerRef.current, {
      center: [36.5, 127.8],
      zoom: 7,
    })
    L.tileLayer(getVWorldTileUrl(), {
      maxZoom: 19,
      attribution: '© 국토지리정보원',
    }).addTo(mapRef.current)
    mapRef.current.invalidateSize()
    layerRef.current = L.layerGroup().addTo(mapRef.current)
    setReady(true)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // count 변경 시 마커 재생성
  useEffect(() => {
    if (!ready) return

    layerRef.current.clearLayers()
    const points = generatePoints(count)

    const t0 = performance.now()
    points.forEach(({ lat, lng, risk_score }) => {
      const color = getRiskColor(risk_score)
      L.circleMarker([lat, lng], {
        radius: 6,
        fillColor: color,
        color: '#fff',
        weight: 1.5,
        fillOpacity: 0.85,
      }).addTo(layerRef.current)
    })
    const elapsed = performance.now() - t0

    setStats({ count, elapsed: elapsed.toFixed(1) })
  }, [count, ready])

  return (
    <div className="flex flex-col h-dvh bg-gray-900 text-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 shrink-0">
        <span className="font-bold text-sm">지도 성능 시뮬레이션</span>
        <a href="/" className="text-xs text-gray-400 hover:text-white">← 홈</a>
      </div>

      {/* 지도 */}
      <div className="relative flex-1 min-h-0">
        <div ref={containerRef} className="absolute inset-0" />

        {/* 성능 정보 */}
        {stats && (
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2 z-[1000] text-xs space-y-0.5">
            <div className="text-gray-300">마커 수: <span className="text-white font-bold">{stats.count.toLocaleString()}개</span></div>
            <div className="text-gray-300">렌더 시간: <span className={`font-bold ${stats.elapsed < 100 ? 'text-emerald-400' : stats.elapsed < 500 ? 'text-yellow-400' : 'text-red-400'}`}>{stats.elapsed}ms</span></div>
          </div>
        )}

        {/* 범례 */}
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2 z-[1000] text-xs space-y-1">
          {[
            { color: '#4CAF50', label: '낮음 (2-3)' },
            { color: '#FFC107', label: '보통 (4-5)' },
            { color: '#FF9800', label: '높음 (6-7)' },
            { color: '#F44336', label: '매우 높음 (8-10)' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border border-white/30 shrink-0" style={{ backgroundColor: color }} />
              <span className="text-gray-200">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 카운트 선택 */}
      <div className="flex gap-2 px-4 py-3 bg-gray-800 border-t border-gray-700 shrink-0">
        {COUNTS.map((c) => (
          <button
            key={c}
            onClick={() => setCount(c)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              count === c
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {c.toLocaleString()}
          </button>
        ))}
      </div>
    </div>
  )
}
