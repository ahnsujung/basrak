import { getRiskColor } from '@/utils/riskCalculator'

const ITEMS = [
  { score: 2, label: '낮음' },
  { score: 4, label: '보통' },
  { score: 7, label: '높음' },
  { score: 10, label: '매우 높음' },
]

export default function MapLegend({ count }) {
  return (
    <div className="absolute bottom-32 right-6 z-[1000] bg-white/80 backdrop-blur-sm rounded-xl px-2.5 py-2 shadow-sm border border-gray-100/60">
      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        {ITEMS.map(({ score, label }) => (
          <div key={score} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: getRiskColor(score) }}
            />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
      {count != null && (
        <span className="text-[11px] text-gray-400 border-t border-gray-200 pt-1 mt-1 block">
          24h · {count}건
        </span>
      )}
    </div>
  )
}
