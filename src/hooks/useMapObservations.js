import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useMapObservations() {
  const [observations, setObservations] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  // 인증 상태 변경 감지 — 세션 복원 후 재조회
  useEffect(() => {
    supabase.auth.getSession().then(() => setAuthReady(true))
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setAuthReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!authReady) return
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
          setError(fetchErr.message)
        } else {
          if (data) setObservations(data)
          if (count != null) setTotalCount(count)
        }
        setLoading(false)
      }).catch((e) => {
        if (!mounted) return
        setError(e.message || '네트워크 오류가 발생했습니다')
        setLoading(false)
      })
    }

    fetchData()
    const interval = setInterval(fetchData, 5 * 60 * 1000)

    return () => { mounted = false; clearInterval(interval) }
  }, [authReady])

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
