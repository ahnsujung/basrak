const LEVELS = [
  { min: 0,    max: 199,  label: '새싹 관찰자',    icon: '🌱', color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
  { min: 200,  max: 499,  label: '숲길 기록자',    icon: '🌿', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { min: 500,  max: 999,  label: '바스락 마스터',  icon: '🍂', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  { min: 1000, max: Infinity, label: '산봉감시 파수꾼', icon: '🏔️', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
]

export function getLevelInfo(points) {
  return LEVELS.find((l) => points >= l.min && points <= l.max) ?? LEVELS[0]
}

export function getNextLevelPoints(points) {
  const current = LEVELS.findIndex((l) => points >= l.min && points <= l.max)
  return current < LEVELS.length - 1 ? LEVELS[current + 1].min : null
}

export default function LevelBadge({ points = 0, size = 'md' }) {
  const level = getLevelInfo(points)

  if (size === 'sm') {
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${level.bg} ${level.border} ${level.color}`}>
        {level.icon} {level.label}
      </span>
    )
  }
  const next = getNextLevelPoints(points)
  const progress = next
    ? Math.round(((points - level.min) / (next - level.min)) * 100)
    : 100

  return (
    <div className={`rounded-2xl border px-4 py-4 ${level.bg} ${level.border}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{level.icon}</span>
        <div>
          <p className={`text-base font-bold ${level.color}`}>{level.label}</p>
          <p className="text-sm text-gray-500">{points.toLocaleString()} pt</p>
        </div>
      </div>
      {next && (
        <>
          <div className="w-full h-2 bg-white/70 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${level.color.replace('text', 'bg')}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">
            다음 등급까지 {(next - points).toLocaleString()} pt
          </p>
        </>
      )}
    </div>
  )
}
