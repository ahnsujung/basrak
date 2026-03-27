export default function LocalContributionCard({ data }) {
  if (!data) return null

  return (
    <div className="absolute bottom-20 left-4 right-16 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm border border-gray-100">
      <p className="text-xs text-gray-400 mb-0.5">내 주변 10km · 최근 7일</p>
      <div className="flex items-baseline gap-3">
        <span className="text-sm">
          관찰자 <strong className="text-green-700">{data.uniqueUsers}명</strong>
        </span>
        <span className="text-sm">
          내 기여 <strong className="text-green-700">{data.myRatio}%</strong>
        </span>
      </div>
    </div>
  )
}
