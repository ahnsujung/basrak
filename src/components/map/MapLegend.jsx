import { getRiskColor } from '@/utils/riskCalculator'

const ITEMS = [
  { score: 2, label: '낮음' },
  { score: 4, label: '보통' },
  { score: 7, label: '높음' },
  { score: 10, label: '매우 높음' },
]

export default function MapLegend({ count }) {
  return (
    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg px-3 py-2.5 z-[1000]">
      <p className="text-xs font-semibold text-gray-500 mb-1.5">산불 위험도</p>
      <div className="flex flex-col gap-1.5">
        {ITEMS.map(({ score, label }) => (
          <div key={score} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0 border border-white shadow-sm"
              style={{ backgroundColor: getRiskColor(score) }}
            />
            <span className="text-xs text-gray-600">{label}</span>
          </div>
        ))}
      </div>
      {count != null && (
        <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-100 pt-1.5">
          최근 24시간 {count}건
        </p>
      )}
    </div>
  )
}
