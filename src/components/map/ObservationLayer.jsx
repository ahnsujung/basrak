import { useEffect, useRef } from 'react'
import L from 'leaflet'
// import 'leaflet.heat'
// import { supabase } from '@/lib/supabase'
import { renderCircleMode } from '@/utils/circleMode'
// import { getRiskColor } from '@/utils/riskCalculator'
// import { risk } from '@/constants/theme'

/* 히트맵 모드 — 줌 레벨별 전환 구현 후 활성화
function useHeatmapGrid() {
  const [gridData, setGridData] = useState(null)

  useEffect(() => {
    let mounted = true
    const today = new Date().toISOString().split('T')[0]

    supabase
      .from('daily_maps')
      .select('grid_data')
      .eq('date', today)
      .maybeSingle()
      .then(({ data }) => {
        if (mounted && data?.grid_data) setGridData(data.grid_data)
      })
      .catch(() => {})

    return () => { mounted = false }
  }, [])

  return gridData
}

function renderHeatmap(layerGroup, observations, gridData) {
  if (gridData) {
    const heatPoints = gridData.map((p) => [p.lat, p.lng, p.intensity / 10])

    L.heatLayer(heatPoints, {
      radius: 30,
      blur: 25,
      maxZoom: 10,
      gradient: {
        0.3: risk.low,
        0.5: risk.moderate,
        0.7: risk.high,
        1.0: risk.critical,
      },
    }).addTo(layerGroup)
  }

  observations.forEach((obs) => {
    L.circleMarker([obs.lat, obs.lng], {
      radius: 5,
      color: '#fff',
      weight: 1,
      fillColor: getRiskColor(obs.risk_score),
      fillOpacity: 0.8,
    })
      .bindPopup(`위험도: ${obs.risk_score}/10`)
      .addTo(layerGroup)
  })
}
*/

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

    layerGroupRef.current.clearLayers()

    renderCircleMode(layerGroupRef.current, observations, totalCount, (clicked) => {
      const zoom = map.getZoom()
      const threshold = 0.5 / Math.pow(2, zoom - 7)
      const nearby = observations.filter(o =>
        Math.abs(o.lat - clicked.lat) < threshold && Math.abs(o.lng - clicked.lng) < threshold
      )
      onSelect?.(nearby.length > 1 ? nearby : clicked)
    })
  }, [map, observations, totalCount]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
