import Spinner from '@/components/ui/Spinner'

export default function LocationStatus({ status, coords }) {
  // status: 'acquiring' | 'ready' | 'denied' | 'error'

  if (status === 'acquiring') {
    return (
      <div className="mx-4 flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3">
        <Spinner size="sm" color="border-blue-500" />
        <p className="text-sm text-blue-700">현재 위치 확인 중...</p>
      </div>
    )
  }

  if (status === 'ready' && coords) {
    return (
      <div className="mx-4 flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3">
        <span className="text-lg">📍</span>
        <div>
          <p className="text-sm font-medium text-green-800">위치 확인됨</p>
          <p className="text-xs text-green-600">
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </p>
        </div>
      </div>
    )
  }

  if (status === 'denied') {
    return (
      <div className="mx-4 flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3">
        <span className="text-lg">🚫</span>
        <div>
          <p className="text-sm font-medium text-red-800">위치 접근 거부됨</p>
          <p className="text-xs text-red-600">설정에서 위치 권한을 허용해 주세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-4 flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-3">
      <span className="text-lg">⚠️</span>
      <p className="text-sm text-gray-600">위치를 가져올 수 없습니다</p>
    </div>
  )
}
