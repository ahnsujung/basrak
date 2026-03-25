import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Spinner from '@/components/ui/Spinner'

const REASON_LABEL = {
  observation: '관측 등록',
  streak: '연속 참여 보너스',
  bonus: '특별 보너스',
}

export default function PointHistory({ userId }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    supabase
      .from('point_logs')
      .select('id, points, reason, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setLogs(data ?? [])
        setLoading(false)
      })
  }, [userId])

  if (loading) return <div className="flex justify-center py-6"><Spinner /></div>
  if (!logs.length) return <p className="text-sm text-gray-400 text-center py-6">포인트 이력이 없습니다</p>

  return (
    <div className="flex flex-col gap-2">
      {logs.map((log) => (
        <div key={log.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
          <div>
            <p className="text-sm text-gray-800">{REASON_LABEL[log.reason] ?? log.reason}</p>
            <p className="text-xs text-gray-400">
              {new Date(log.created_at).toLocaleDateString('ko-KR', {
                month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          <span className="text-sm font-semibold text-[#2d6a4f]">+{log.points} pt</span>
        </div>
      ))}
    </div>
  )
}
