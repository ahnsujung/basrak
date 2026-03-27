const RANK_MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function LocalContributionCard({ data }) {
  if (!data) return null

  return (
    <div className="absolute top-3 left-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm text-gray-600 shrink-0">
            관찰자 <strong className="text-green-700">{data.uniqueUsers}명</strong>
          </span>
          {data.uniqueUsers > 0 && (
            <span className="text-sm text-gray-600 shrink-0">
              내 기여 <strong className="text-green-700">{data.myRatio}%</strong>
            </span>
          )}
        </div>
        {data.provinceName && data.provinceRank && (
          <span className="text-xs font-semibold text-orange-600 shrink-0">
            {RANK_MEDAL[data.provinceRank] ?? `${data.provinceRank}위`} {data.provinceName} 전국 {data.provinceRank}등!
          </span>
        )}
      </div>
      <p className="text-[10px] text-gray-400 mt-0.5">주변 10km · 최근 7일 · 누적 관측 기준</p>
    </div>
  )
}
