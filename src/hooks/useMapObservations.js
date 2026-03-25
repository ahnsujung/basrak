import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useMapObservations() {
  const [observations, setObservations] = useState([])
  const [loading, setLoading] = useState(true)

  // 최초 24시간치 데이터 조회
  useEffect(() => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    supabase
      .from('observations')
      .select('id, lat, lng, dryness_level, wind_level, risk_score, photo_url, observed_at')
      .gte('observed_at', since)
      .order('observed_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setObservations(data)
        setLoading(false)
      })
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
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return { observations, loading }
}
