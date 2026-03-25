import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useMapObservations() {
  const [observations, setObservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    supabase
      .from('observations')
      .select('id, lat, lng, dryness_level, wind_level, risk_score, observed_at')
      .gte('observed_at', since)
      .order('observed_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setObservations(data)
        setLoading(false)
      })
  }, [])

  return { observations, loading }
}
