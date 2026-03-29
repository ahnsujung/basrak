import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useMyObservations(userId) {
  const [observations, setObservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return
    let mounted = true

    supabase
      .from('observations')
      .select('id, lat, lng, dryness_level, wind_level, risk_score, photo_url, observed_at, address')
      .eq('user_id', userId)
      .order('observed_at', { ascending: false })
      .limit(30)
      .then(({ data, error: err }) => {
        if (!mounted) return
        if (err) {
          setError('관측 이력을 불러오지 못했습니다')
        } else {
          setObservations(data ?? [])
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

  const deleteObservation = async (id, photoUrl) => {
    // R2 사진 삭제
    if (photoUrl) {
      const r2Public = import.meta.env.VITE_R2_PUBLIC_URL
      const workerUrl = import.meta.env.VITE_R2_WORKER_URL
      if (r2Public && workerUrl && photoUrl.startsWith(r2Public)) {
        const key = photoUrl.replace(r2Public + '/', '')
        await fetch(`${workerUrl}/${key}`, { method: 'DELETE' }).catch(() => {})
      }
    }

    // DB에서 관측 삭제
    const { error: err } = await supabase
      .from('observations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (err) throw err
    setObservations((prev) => prev.filter((o) => o.id !== id))
  }

  return { observations, loading, error, deleteObservation }
}
