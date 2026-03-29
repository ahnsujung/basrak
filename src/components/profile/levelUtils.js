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
