import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useLocalContribution(lat, lng, userId) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!lat || !lng || !userId) return

    const delta = 10 / 111
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    supabase
      .from('observations')
      .select('user_id')
      .gte('lat', lat - delta)
      .lte('lat', lat + delta)
      .gte('lng', lng - delta)
      .lte('lng', lng + delta)
      .gte('observed_at', since)
      .then(({ data: obs }) => {
        if (!obs) return
        const uniqueUsers = new Set(obs.map(o => o.user_id)).size
        const totalObs = obs.length
        const myObs = obs.filter(o => o.user_id === userId).length
        const myRatio = totalObs > 0 ? Math.round((myObs / totalObs) * 100) : 0
        setData({ uniqueUsers, myRatio })
      })
  }, [lat, lng, userId])

  return data
}
