const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' }

function getRankDisplay(data) {
  const { nationalRank, provinceName, provinceRank } = data
  // 전국 10위 이내
  if (nationalRank && nationalRank <= 10) {
    const medal = MEDAL[nationalRank] || ''
    return { text: `${medal} 전국 ${nationalRank}등`, color: 'text-red-600' }
  }
  // 지역 10위 이내
  if (provinceName && provinceRank && provinceRank <= 10) {
    const medal = MEDAL[provinceRank] || ''
    return { text: `${medal} ${provinceName} ${provinceRank}등`, color: 'text-orange-600' }
  }
  return null
}

export default function LocalContributionCard({ data }) {
  if (!data) return null

  const rank = getRankDisplay(data)

  return (
    <div className="absolute top-3 left-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-gray-100">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm text-gray-600 shrink-0">
            관찰자 <strong className="text-brand">{data.uniqueUsers}명</strong>
          </span>
          {data.uniqueUsers > 0 && (
            <span className="text-sm text-gray-600 shrink-0">
              내 기여 <strong className="text-brand">{data.myRatio}%</strong>
            </span>
          )}
        </div>
        {rank && (
          <span className={`text-xs font-semibold ${rank.color} shrink-0`}>
            {rank.text}
          </span>
        )}
      </div>
      <p className="typo-caption-tiny mt-0.5">주변 10km · 최근 7일 · 누적 관측 기준</p>
    </div>
  )
}
