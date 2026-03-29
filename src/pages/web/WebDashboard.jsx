export default function WebDashboard() {
  return (
    <div>
      <header className="px-4 pt-6 pb-2">
        <h1 className="text-xl font-bold text-gray-900">대시보드</h1>
        <p className="text-xs text-gray-500 mt-1">전체 현황을 한눈에 확인하세요</p>
      </header>
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: '전체 관측', value: '-' },
            { label: '오늘 관측', value: '-' },
            { label: '전체 사용자', value: '-' },
            { label: '고위험 관측', value: '-' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs text-gray-500 mb-1.5">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-400">차트 및 상세 통계 (추후 구현)</p>
        </div>
      </div>
    </div>
  )
}
