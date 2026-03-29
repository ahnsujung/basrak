import { Flame, Shield } from 'lucide-react'

export default function StreakBanner({ streakDays, hasShield }) {
  if (!streakDays) return null

  return (
    <div className="flex items-center gap-2 px-5 py-2 bg-orange-50 border-b border-orange-100">
      <Flame size={16} className="text-orange-500" />
      <span className="typo-body-strong text-orange-700">{streakDays}일째 연속 관찰 중</span>
      {hasShield && (
        <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
          <Shield size={12} /> 복구권 보유
        </span>
      )}
    </div>
  )
}
