import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GRID_RESOLUTION = 0.1
const KOREA_BOUNDS = {
  minLat: 33.0, maxLat: 38.9,
  minLng: 124.5, maxLng: 131.0,
}
const MAX_DIST = 0.5 // 가장 가까운 관측이 이 거리(도) 이상이면 skip (~50km)

function nearestDist(
  points: { lat: number; lng: number; value: number }[],
  targetLat: number,
  targetLng: number,
) {
  let min = Infinity
  for (const p of points) {
    const d = Math.sqrt((p.lat - targetLat) ** 2 + (p.lng - targetLng) ** 2)
    if (d < min) min = d
  }
  return min
}

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
    if (dist < 0.001) return p.value
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

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data: observations } = await supabase
    .from('observations')
    .select('lat, lng, risk_score')
    .gte('observed_at', since)

  const count = observations?.length ?? 0
  const mode = count >= 100 ? 'heatmap' : 'circles'

  let gridData = null

  if (mode === 'heatmap' && observations && observations.length > 0) {
    const points = observations.map((o) => ({
      lat: o.lat, lng: o.lng, value: o.risk_score,
    }))

    gridData = []
    for (let lat = KOREA_BOUNDS.minLat; lat <= KOREA_BOUNDS.maxLat; lat += GRID_RESOLUTION) {
      for (let lng = KOREA_BOUNDS.minLng; lng <= KOREA_BOUNDS.maxLng; lng += GRID_RESOLUTION) {
        // 가장 가까운 관측이 50km 이상이면 skip
        if (nearestDist(points, lat, lng) > MAX_DIST) continue
        const value = idw(points, lat, lng)
        if (value !== null) {
          gridData.push({ lat, lng, intensity: value })
        }
      }
    }
  }

  await supabase.from('daily_maps').upsert(
    { date: today, mode, observation_count: count, grid_data: gridData },
    { onConflict: 'date' },
  )

  return new Response(JSON.stringify({ mode, count, gridPoints: gridData?.length ?? 0 }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
