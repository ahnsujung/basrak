import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function usePointHistory(userId) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return
    let mounted = true

    supabase
      .from('point_logs')
      .select('id, points, reason, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data, error: err }) => {
        if (!mounted) return
        if (err) {
          setError('포인트 이력을 불러오지 못했습니다')
        } else {
          setLogs(data ?? [])
        }
        setLoading(false)
      })
      .catch(() => {
        if (!mounted) return
        setError('네트워크 오류가 발생했습니다')
        setLoading(false)
      })

    return () => { mounted = false }
  }, [userId])

  return { logs, loading, error }
}
