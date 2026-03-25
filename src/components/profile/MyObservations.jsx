import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import { getRiskLabel, getRiskColor } from '@/utils/riskCalculator'

const RISK_VARIANT = (score) => {
  if (score <= 3) return 'green'
  if (score <= 5) return 'yellow'
  if (score <= 7) return 'orange'
  return 'red'
}

export default function MyObservations({ userId }) {
  const [observations, setObservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    supabase
      .from('observations')
      .select('id, dryness_level, wind_level, risk_score, photo_url, observed_at')
      .eq('user_id', userId)
      .order('observed_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setObservations(data ?? [])
        setLoading(false)
      })
  }, [userId])

  if (loading) return <div className="flex justify-center py-6"><Spinner /></div>
  if (!observations.length) return <p className="text-sm text-gray-400 text-center py-6">관측 이력이 없습니다</p>

  return (
    <div className="flex flex-col gap-2">
      {observations.map((obs) => (
        <div key={obs.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
          {obs.photo_url ? (
            <img src={obs.photo_url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🍂</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Badge variant={RISK_VARIANT(obs.risk_score)}>
                {getRiskLabel(obs.risk_score)}
              </Badge>
              <span className="text-xs text-gray-400">건조 {obs.dryness_level} · 풍속 {obs.wind_level}</span>
            </div>
            <p className="text-xs text-gray-400">
              {new Date(obs.observed_at).toLocaleDateString('ko-KR', {
                month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
