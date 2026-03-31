import { getRiskColor } from '@/utils/riskCalculator'

const ITEMS = [
  { score: 2, label: '낮음' },
  { score: 4, label: '보통' },
  { score: 7, label: '높음' },
  { score: 10, label: '매우 높음' },
]

export default function MapLegend({ count }) {
  return (
    <div className="absolute top-[4.5rem] left-4 z-[1000] bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1.5 shadow-sm border border-gray-100/60">
      <div className="flex items-center gap-2.5">
        {ITEMS.map(({ score, label }) => (
          <div key={score} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getRiskColor(score) }}
            />
            <span className="text-[11px] text-gray-500">{label}</span>
          </div>
        ))}
        {count != null && (
          <span className="text-[11px] text-gray-400 border-l border-gray-200 pl-2">
            24h · {count}건
          </span>
        )}
      </div>
    </div>
  )
}
