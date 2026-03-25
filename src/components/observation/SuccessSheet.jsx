import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { getRiskLabel, getRiskColor } from '@/utils/riskCalculator'

export default function SuccessSheet({ open, dryness, wind, onClose }) {
  const score = (dryness ?? 0) + (wind ?? 0)
  const riskLabel = getRiskLabel(score)
  const riskColor = getRiskColor(score)

  return (
    <Modal open={open} onClose={onClose}>
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">관측 등록 완료!</h2>
        <p className="text-sm text-gray-500 mb-5">+10 포인트 적립됐어요</p>

        <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-2xl py-3 px-4 mb-6">
          <span className="text-sm text-gray-500">위험도</span>
          <span
            className="text-sm font-bold px-3 py-0.5 rounded-full text-white"
            style={{ backgroundColor: riskColor }}
          >
            {riskLabel}
          </span>
          <span className="text-sm text-gray-400">({score}점)</span>
        </div>

        <Button fullWidth onClick={onClose}>
          확인
        </Button>
      </div>
    </Modal>
  )
}
