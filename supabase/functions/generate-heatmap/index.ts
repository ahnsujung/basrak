import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GRID_RESOLUTION = 0.1 // 격자 간격 (도 단위, 약 10km)
const KOREA_BOUNDS = {
  minLat: 33.0, maxLat: 38.9,
  minLng: 124.5, maxLng: 131.0,
}

// IDW 보간 함수 (Inverse Distance Weighting)
function idw(
  points: { lat: number; lng: number; value: number }[],
  targetLat: number,
  targetLng: number,
  power = 2,
) {
  if (points.length === 0) return null

  let weightedSum = 0
  let totalWeight = 0

  for (const p of points) {
    const dist = Math.sqrt((p.lat - targetLat) ** 2 + (p.lng - targetLng) ** 2)
    if (dist < 0.001) return p.value // 관측점과 거의 동일 위치
    const weight = 1 / Math.pow(dist, power)
    weightedSum += weight * p.value
    totalWeight += weight
  }

  return weightedSum / totalWeight
}

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // 오늘 관측 데이터 조회
  const today = new Date().toISOString().split('T')[0]
  const { data: observations } = await supabase
    .from('observations')
    .select('lat, lng, risk_score')
    .gte('observed_at', `${today}T00:00:00`)

  const count = observations?.length ?? 0
  const mode = count >= 100 ? 'heatmap' : 'circles'

  let gridData = null

  if (mode === 'heatmap' && observations && observations.length > 0) {
    const points = observations.map((o) => ({
      lat: o.lat,
      lng: o.lng,
      value: o.risk_score,
    }))

    gridData = []
    for (
      let lat = KOREA_BOUNDS.minLat;
      lat <= KOREA_BOUNDS.maxLat;
      lat += GRID_RESOLUTION
    ) {
      for (
        let lng = KOREA_BOUNDS.minLng;
        lng <= KOREA_BOUNDS.maxLng;
        lng += GRID_RESOLUTION
      ) {
        const value = idw(points, lat, lng)
        if (value !== null) {
          gridData.push({ lat, lng, intensity: value })
        }
      }
    }
  }

  // 저장 (upsert)
  await supabase.from('daily_maps').upsert(
    {
      date: today,
      mode,
      observation_count: count,
      grid_data: gridData,
    },
    { onConflict: 'date' },
  )

  return new Response(JSON.stringify({ mode, count }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
