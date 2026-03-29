import Spinner from '@/components/ui/Spinner'
import { MapPin, Ban, AlertTriangle } from 'lucide-react'

export default function LocationStatus({ status, coords }) {
  if (status === 'acquiring') {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3">
        <Spinner size="sm" color="border-blue-500" />
        <p className="text-sm text-blue-700">현재 위치 확인 중...</p>
      </div>
    )
  }

  if (status === 'ready' && coords) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3">
        <MapPin size={20} className="text-green-600 shrink-0" />
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
      <div className="rounded-2xl bg-red-50 px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <Ban size={20} className="text-red-500 shrink-0" />
          <p className="text-sm font-bold text-red-800">위치 접근 거부됨</p>
        </div>
        <p className="text-xs text-red-600 leading-relaxed mb-2">
          관측 위치를 지도에 표시하기 위해 위치 정보가 필요합니다.
          위치 없이는 관찰을 등록할 수 없어요.
        </p>
        <div className="text-xs text-red-500 bg-red-100 rounded-lg px-3 py-2 leading-relaxed">
          <p className="font-semibold mb-0.5">위치 권한 켜는 방법</p>
          <p>iPhone Safari: 설정 → 개인정보 보호 → 위치 서비스 → Safari</p>
          <p>iPhone Chrome: 설정 → Chrome → 위치 → 허용</p>
          <p>Android: 설정 → 앱 → 브라우저 → 권한 → 위치</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-yellow-50 px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={20} className="text-yellow-600 shrink-0" />
        <p className="text-sm font-bold text-yellow-800">위치를 가져올 수 없습니다</p>
      </div>
      <p className="text-xs text-yellow-700 leading-relaxed mb-2">
        GPS 신호가 약하거나 브라우저에서 위치를 확인하지 못했습니다.
        Wi-Fi를 켜거나 실외로 이동하면 정확도가 올라갑니다.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-lg px-3 py-1.5 active:scale-[0.97]"
      >
        다시 시도하기
      </button>
    </div>
  )
}
