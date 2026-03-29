import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useMapObservations() {
  const [observations, setObservations] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    const fetchData = () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      Promise.all([
        supabase
          .from('observations')
          .select('id, lat, lng, dryness_level, wind_level, risk_score, photo_url, observed_at')
          .gte('observed_at', since)
          .order('observed_at', { ascending: false }),
        supabase.rpc('get_observation_count'),
      ]).then(([{ data, error: fetchErr }, { data: count }]) => {
        if (!mounted) return
        if (fetchErr) {
          setError('관측 데이터를 불러오지 못했습니다')
        } else {
          if (data) setObservations(data)
          if (count != null) setTotalCount(count)
        }
        setLoading(false)
      }).catch(() => {
        if (!mounted) return
        setError('네트워크 오류가 발생했습니다')
        setLoading(false)
      })
    }

    fetchData()
    const interval = setInterval(fetchData, 5 * 60 * 1000)

    return () => { mounted = false; clearInterval(interval) }
  }, [])

  // Realtime: 새 관측 실시간 추가
  useEffect(() => {
    const channel = supabase
      .channel('observations-inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'observations' },
        (payload) => {
          setObservations((prev) => [payload.new, ...prev])
          setTotalCount((prev) => prev + 1)
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return { observations, totalCount, loading, error }
}
