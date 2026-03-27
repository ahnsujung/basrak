export default function StreakBanner({ streakDays, hasShield }) {
  if (!streakDays) return null

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border-b border-orange-100 text-sm">
      <span>🔥</span>
      <span className="font-medium text-orange-700">{streakDays}일째 연속 관찰 중</span>
      {hasShield && (
        <span className="ml-auto text-xs text-gray-400">🛡 복구권 보유</span>
      )}
    </div>
  )
}
