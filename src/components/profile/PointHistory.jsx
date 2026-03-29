import Spinner from '@/components/ui/Spinner'
import { usePointHistory } from '@/hooks/usePointHistory'

const REASON_LABEL = {
  observation: '관측 등록',
  streak: '연속 참여 보너스',
  bonus: '특별 보너스',
}

export default function PointHistory({ userId }) {
  const { logs, loading, error } = usePointHistory(userId)

  if (loading) return <div className="flex justify-center py-6"><Spinner /></div>
  if (error) return <p className="text-sm text-red-500 text-center py-6">{error}</p>
  if (!logs.length) return <p className="text-sm text-gray-400 text-center py-6">포인트 이력이 없습니다</p>

  return (
    <div className="flex flex-col">
      {logs.map((log) => (
        <div key={log.id} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
          <div>
            <p className="text-sm text-gray-800">{REASON_LABEL[log.reason] ?? log.reason}</p>
            <p className="text-xs text-gray-400">
              {new Date(log.created_at).toLocaleDateString('ko-KR', {
                month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          <span className="text-sm font-semibold text-brand">+{log.points} pt</span>
        </div>
      ))}
    </div>
  )
}
