import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet.heat'
import { supabase } from '@/lib/supabase'
import { renderCircleMode } from '@/utils/circleMode'
import { getRiskColor } from '@/utils/riskCalculator'

export default function ObservationLayer({ map, observations, totalCount, onSelect }) {
  const layerGroupRef = useRef(null)

  useEffect(() => {
    if (!map) return

    // layerGroup 초기화 (최초 1회)
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

    const mode = totalCount >= 100 ? 'heatmap' : 'circles'

    if (mode === 'circles') {
      renderCircleMode(layerGroupRef.current, observations, totalCount)

      // 마커 클릭 → 상세 선택 콜백
      layerGroupRef.current.eachLayer((layer) => {
        if (layer._popup) {
          layer.on('click', () => {
            const obs = observations.find(
              (o) => layer.getLatLng && layer.getLatLng().lat === o.lat && layer.getLatLng().lng === o.lng,
            )
            if (obs) onSelect?.(obs)
          })
        }
      })
    } else {
      renderHeatmap(layerGroupRef.current, observations)
    }
  }, [map, observations, totalCount]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

async function renderHeatmap(layerGroup, observations) {
  // daily_maps에서 grid_data 가져오기
  const today = new Date().toISOString().split('T')[0]
  const { data: mapData } = await supabase
    .from('daily_maps')
    .select('grid_data')
    .eq('date', today)
    .single()

  if (mapData?.grid_data) {
    // [{lat, lng, intensity}] → [[lat, lng, intensity]]
    const heatPoints = mapData.grid_data.map((p) => [p.lat, p.lng, p.intensity / 10])

    L.heatLayer(heatPoints, {
      radius: 30,
      blur: 25,
      maxZoom: 10,
      gradient: {
        0.3: '#4CAF50',
        0.5: '#FFC107',
        0.7: '#FF9800',
        1.0: '#F44336',
      },
    }).addTo(layerGroup)
  }

  // 히트맵 위에 실제 관측 마커도 작게 표시
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
