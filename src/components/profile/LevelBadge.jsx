import { getLevelInfo, getNextLevelPoints } from './levelUtils'

export default function LevelBadge({ points = 0, size = 'md' }) {
  const level = getLevelInfo(points)

  if (size === 'sm') {
    return (
      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${level.bg} ${level.border}`}>
        <span className="text-lg leading-none">{level.icon}</span>
      </div>
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
