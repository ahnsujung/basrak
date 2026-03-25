import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { getRiskLabel, getRiskColor } from '@/utils/riskCalculator'

const RISK_VARIANT = (score) => {
  if (score <= 3) return 'green'
  if (score <= 5) return 'yellow'
  if (score <= 7) return 'orange'
  return 'red'
}

const DRYNESS_LABEL = ['', '촉촉함', '구겨짐', '쪼개짐', '바스라짐']
const WIND_LABEL = ['', '바람 없음', '산들바람', '약한 바람', '보통 바람', '강한 바람', '매우 강한 바람']

export default function ObservationSheet({ observation, onClose }) {
  if (!observation) return null

  const { dryness_level, wind_level, risk_score, photo_url, observed_at } = observation
  const color = getRiskColor(risk_score)

  return (
    <Modal open={!!observation} onClose={onClose}>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex-shrink-0 border-2 border-white shadow"
          style={{ backgroundColor: color }}
        />
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={RISK_VARIANT(risk_score)}>{getRiskLabel(risk_score)}</Badge>
            <span className="text-sm font-semibold text-gray-700">위험도 {risk_score}점</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(observed_at).toLocaleDateString('ko-KR', {
              month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
          <p className="text-xs text-gray-400 mb-0.5">낙엽 건조도</p>
          <p className="text-sm font-semibold text-gray-800">
            단계 {dryness_level} · {DRYNESS_LABEL[dryness_level]}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
          <p className="text-xs text-gray-400 mb-0.5">체감 풍속</p>
          <p className="text-sm font-semibold text-gray-800">
            단계 {wind_level} · {WIND_LABEL[wind_level]}
          </p>
        </div>
      </div>

      {photo_url && (
        <img
          src={photo_url}
          alt="관측 사진"
          className="w-full h-40 object-cover rounded-2xl"
        />
      )}
    </Modal>
  )
}
