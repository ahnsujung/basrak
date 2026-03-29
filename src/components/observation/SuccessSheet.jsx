import { CircleCheck } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { getRiskLabel, getRiskColor, calcRiskScore } from '@/utils/riskCalculator'

const DRYNESS_LABEL = ['', '촉촉함', '구겨짐', '쪼개짐', '바스라짐']
const WIND_LABEL = ['', '없음', '산들바람', '약한 바람', '보통 바람', '강한 바람', '매우 강함']

export default function SuccessSheet({ open, dryness, wind, onClose }) {
  const score = calcRiskScore(dryness, wind)
  const label = getRiskLabel(score)
  const pct = ((score - 1) / 9) * 100

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

        {/* 위험도 바 */}
        <div className="bg-gray-50 rounded-2xl px-4 py-3.5 mb-3">
          <div className="relative mb-2" style={{
            left: `${pct}%`,
            transform: `translateX(${pct < 20 ? '0%' : pct > 80 ? '-100%' : '-50%'})`,
            width: 'fit-content',
          }}>
            <span className="text-sm font-black text-gray-800">{label}</span>
          </div>
          <div className="relative">
            <div className="h-2 rounded-full"
              style={{ background: 'linear-gradient(to right, #81C784, #FFE300, #FF6D00, #D32F2F)' }}
            />
            <div
              className="absolute top-1/2 w-5 h-5 rounded-full bg-gray-700 border-[3px] border-white shadow-md"
              style={{ left: `${pct}%`, transform: 'translateX(-50%) translateY(-50%)' }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[11px] text-gray-500">낮음</span>
            <span className="text-[11px] text-gray-500">매우 높음</span>
          </div>
        </div>

        {/* 건조도 / 풍속 2열 */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-50 rounded-2xl px-4 py-3">
            <p className="text-[10px] text-gray-500 mb-0.5">낙엽 건조도</p>
            <p className="text-sm font-bold text-gray-800">
              {dryness}단계 · {DRYNESS_LABEL[dryness]}
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl px-4 py-3">
            <p className="text-[10px] text-gray-500 mb-0.5">체감 풍속</p>
            <p className="text-sm font-bold text-gray-800">
              {wind}단계 · {WIND_LABEL[wind]}
            </p>
          </div>
        </div>

        <Button fullWidth onClick={onClose}>
          확인
        </Button>
      </div>
    </Modal>
  )
}
