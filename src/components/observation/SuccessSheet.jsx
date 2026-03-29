import { CircleCheck } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { median } from '@/utils/median'

const DRYNESS_LABELS = ['촉촉함', '구겨짐', '쪼개짐', '바스라짐']
const WIND_LABELS = ['없음', '산들', '약함', '보통', '강함', '매우강']

function MedianBar({ labels, value, min, max, gradient }) {
  const steps = labels.length
  const pct = ((value - 1) / (steps - 1)) * 100
  return (
    <div>
      {/* 바 */}
      <div className="relative mt-8 mb-2">
        {/* 도트 위 중간값 */}
        <div
          className="absolute -top-6 z-10"
          style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
        >
          <span className="text-xs font-bold text-gray-800">{value.toFixed(2)}</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: gradient }} />
        <div
          className="absolute top-1/2 w-4 h-4 rounded-full bg-brand border-[3px] border-white shadow-md z-10"
          style={{ left: `${pct}%`, transform: 'translateX(-50%) translateY(-50%)' }}
        />
      </div>

      {/* 라벨 */}
      <div className="flex justify-between">
        {labels.map((label, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className={`text-[10px] ${Math.round(value) - 1 === i ? 'font-bold text-gray-700' : 'text-gray-400'}`}>
              {i + 1}
            </span>
            <span className={`text-[9px] mt-0.5 ${Math.round(value) - 1 === i ? 'font-bold text-gray-600' : 'text-gray-300'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SuccessSheet({ open, dryness, wind, nearbyObservations, onClose }) {
  // 근처 관측이 있으면 중간값, 없으면 방금 입력한 값
  const dryValues = nearbyObservations?.map(o => o.dryness_level) ?? []
  const windValues = nearbyObservations?.map(o => o.wind_level) ?? []

  const medDryness = dryValues.length > 0 ? median(dryValues) : dryness
  const medWind = windValues.length > 0 ? median(windValues) : wind
  const minDryness = dryValues.length > 0 ? Math.min(...dryValues) : dryness
  const maxDryness = dryValues.length > 0 ? Math.max(...dryValues) : dryness
  const minWind = windValues.length > 0 ? Math.min(...windValues) : wind
  const maxWind = windValues.length > 0 ? Math.max(...windValues) : wind

  return (
    <Modal open={open} onClose={onClose}>
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CircleCheck size={22} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">관측 등록 완료!</h2>
            <p className="text-xs text-gray-500">+10 포인트 적립</p>
          </div>
        </div>

        {/* 건조도 */}
        <div className="bg-gray-50 rounded-xl px-3.5 py-3 mb-2">
          <p className="text-xs font-bold text-gray-700">건조도</p>
          <MedianBar
            labels={DRYNESS_LABELS}
            value={medDryness}
            min={minDryness}
            max={maxDryness}
            gradient="linear-gradient(to right, #E8D5B7, #C4A26E, #9B7740, #6B4E2A)"
          />
        </div>

        {/* 풍속 */}
        <div className="bg-gray-50 rounded-xl px-3.5 py-3 mb-4">
          <p className="text-xs font-bold text-gray-700">풍속</p>
          <MedianBar
            labels={WIND_LABELS}
            value={medWind}
            min={minWind}
            max={maxWind}
            gradient="linear-gradient(to right, #B8D4E8, #7EB3D4, #4A90BD, #2968A0, #1A4E82, #0D3566)"
          />
        </div>

        <Button fullWidth onClick={onClose}>
          확인
        </Button>
      </div>
    </Modal>
  )
}
