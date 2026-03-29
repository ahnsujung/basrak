import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const PROVINCES = [
  { name: '서울', latMin: 37.43, latMax: 37.70, lngMin: 126.76, lngMax: 127.18 },
  { name: '인천', latMin: 37.25, latMax: 37.83, lngMin: 126.20, lngMax: 126.84 },
  { name: '대구', latMin: 35.67, latMax: 36.10, lngMin: 128.37, lngMax: 128.87 },
  { name: '광주', latMin: 35.03, latMax: 35.28, lngMin: 126.73, lngMax: 126.97 },
  { name: '대전', latMin: 36.20, latMax: 36.50, lngMin: 127.25, lngMax: 127.49 },
  { name: '울산', latMin: 35.43, latMax: 35.74, lngMin: 128.97, lngMax: 129.42 },
  { name: '부산', latMin: 34.87, latMax: 35.40, lngMin: 128.74, lngMax: 129.31 },
  { name: '세종', latMin: 36.40, latMax: 36.67, lngMin: 127.14, lngMax: 127.37 },
  { name: '경기', latMin: 36.90, latMax: 38.30, lngMin: 126.22, lngMax: 127.92 },
  { name: '강원', latMin: 37.00, latMax: 38.61, lngMin: 127.43, lngMax: 129.38 },
  { name: '충북', latMin: 36.10, latMax: 37.23, lngMin: 127.39, lngMax: 128.52 },
  { name: '충남', latMin: 35.87, latMax: 36.94, lngMin: 125.87, lngMax: 127.54 },
  { name: '전북', latMin: 35.22, latMax: 36.12, lngMin: 126.37, lngMax: 127.76 },
  { name: '전남', latMin: 33.90, latMax: 35.40, lngMin: 125.56, lngMax: 127.58 },
  { name: '경북', latMin: 35.67, latMax: 37.24, lngMin: 128.19, lngMax: 129.63 },
  { name: '경남', latMin: 34.70, latMax: 35.90, lngMin: 127.59, lngMax: 129.23 },
  { name: '제주', latMin: 33.10, latMax: 33.60, lngMin: 126.10, lngMax: 126.94 },
]

function getProvince(lat, lng) {
  return PROVINCES.find(
    p => lat >= p.latMin && lat <= p.latMax && lng >= p.lngMin && lng <= p.lngMax
  )
}

export function useLocalContribution(lat, lng, userId) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!lat || !lng) return
    let mounted = true

    const myProvince = getProvince(lat, lng)
    const delta = 10 / 111
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    Promise.all([
      supabase
        .from('observations')
        .select('user_id')
        .gte('lat', lat - delta)
        .lte('lat', lat + delta)
        .gte('lng', lng - delta)
        .lte('lng', lng + delta)
        .gte('observed_at', since),
      ...PROVINCES.map(p =>
        supabase
          .from('observations')
          .select('*', { count: 'exact', head: true })
          .gte('lat', p.latMin)
          .lte('lat', p.latMax)
          .gte('lng', p.lngMin)
          .lte('lng', p.lngMax)
      ),
    ]).then(([localResult, ...provinceCounts]) => {
      if (!mounted) return

      if (localResult.error) {
        setError('지역 데이터를 불러오지 못했습니다')
        return
      }

      const obs = localResult.data ?? []
      const uniqueUsers = new Set(obs.map(o => o.user_id)).size
      const totalObs = obs.length
      const myObs = userId ? obs.filter(o => o.user_id === userId).length : 0
      const myRatio = totalObs > 0 ? Math.round((myObs / totalObs) * 100) : 0

      const ranked = PROVINCES.map((p, i) => ({
        name: p.name,
        count: provinceCounts[i].count ?? 0,
      })).sort((a, b) => b.count - a.count)

      const rank = myProvince
        ? ranked.findIndex(p => p.name === myProvince.name) + 1
        : null

      setData({
        uniqueUsers,
        myRatio,
        provinceName: myProvince ? `${myProvince.name}지역` : null,
        provinceRank: rank,
      })
    }).catch(() => {
      if (!mounted) return
      setError('네트워크 오류가 발생했습니다')
    })

    return () => { mounted = false }
  }, [lat, lng, userId])

  return { data, error }
}
