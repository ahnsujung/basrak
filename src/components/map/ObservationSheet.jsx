import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { getRiskLabel, getRiskColor, calcRiskScore } from '@/utils/riskCalculator'
import { median } from '@/utils/median'

const DRYNESS_LABEL = ['', '촉촉함', '구겨짐', '쪼개짐', '바스라짐']
const WIND_LABEL = ['', '없음', '산들바람', '약한 바람', '보통 바람', '강한 바람', '매우 강함']

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const RISK_LEVELS = [
  { label: '낮음', color: '#81C784' },
  { label: '보통', color: '#FFE300' },
  { label: '높음', color: '#FF6D00' },
  { label: '매우높음', color: '#D32F2F' },
]

function RiskBar({ score }) {
  const label = getRiskLabel(score)
  const pct = ((score - 1) / 9) * 100

  return (
    <div>
      {/* 도트 위 상태 라벨 */}
      <div className="relative mb-2" style={{ left: `${pct}%`, transform: `translateX(${pct < 20 ? '0%' : pct > 80 ? '-100%' : '-50%'})`, width: 'fit-content' }}>
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
  )
}

function SingleCard({ obs, onPhotoClick }) {
  const { dryness_level, wind_level, risk_score, photo_url, observed_at } = obs

  return (
    <div>
      {/* 시간 */}
      <p className="text-xs text-gray-400 mb-3">{formatTime(observed_at)}</p>

      {/* 위험도 바 */}
      <div className="bg-gray-50 rounded-2xl px-4 py-3.5 mb-3">
        <RiskBar score={risk_score} />
      </div>

      {/* 건조도 / 풍속 2열 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-2xl px-4 py-3">
          <p className="text-[10px] text-gray-500 mb-0.5">낙엽 건조도</p>
          <p className="text-sm font-bold text-gray-800">
            {dryness_level}단계 · {DRYNESS_LABEL[dryness_level]}
          </p>
        </div>
        <div className="bg-gray-50 rounded-2xl px-4 py-3">
          <p className="text-[10px] text-gray-500 mb-0.5">체감 풍속</p>
          <p className="text-sm font-bold text-gray-800">
            {wind_level}단계 · {WIND_LABEL[wind_level]}
          </p>
        </div>
      </div>

      {photo_url && (
        <div className="grid grid-cols-6 gap-[3px] mt-3">
          <button onClick={() => onPhotoClick?.(photo_url)}>
            <img
              src={photo_url}
              alt="관측 사진"
              className="w-full aspect-square rounded-md object-cover active:scale-95 transition-transform"
            />
          </button>
        </div>
      )}
    </div>
  )
}

function PhotoViewer({ url, onClose }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90" onClick={onClose}>
      <button className="absolute top-[env(safe-area-inset-top,12px)] right-4 mt-3 w-9 h-9 bg-white/15 rounded-full flex items-center justify-center text-white text-base" onClick={onClose}>
        ✕
      </button>
      <img src={url} alt="관측 사진" className="max-w-full max-h-full object-contain px-5" onClick={(e) => e.stopPropagation()} />
    </div>
  )
}

function PhotoThumbnails({ observations, onSelect }) {
  const withPhotos = observations.filter(o => o.photo_url)
  if (!withPhotos.length) return null

  return (
    <div className="mt-3">
      <p className="text-xs text-gray-400 mb-2">관측 사진 ({withPhotos.length})</p>
      <div className="grid grid-cols-6 gap-[3px]">
        {withPhotos.map((obs) => (
          <button key={obs.id} onClick={() => onSelect(obs.photo_url)}>
            <img
              src={obs.photo_url}
              alt=""
              className="w-full aspect-square rounded-md object-cover active:scale-95 transition-transform"
            />
          </button>
        ))}
      </div>
    </div>
  )
}


function SummaryCard({ observations }) {
  const count = observations.length
  const sorted = [...observations].sort((a, b) => new Date(a.observed_at) - new Date(b.observed_at))
  const earliest = sorted[0].observed_at
  const latest = sorted[sorted.length - 1].observed_at

  const medDryness = Math.round(median(observations.map(o => o.dryness_level)))
  const medWind = Math.round(median(observations.map(o => o.wind_level)))
  const riskScore = calcRiskScore(medDryness, medWind)

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-gray-800">이 지역 관측 {count}건</p>
        <p className="text-xs text-gray-400">{formatTime(earliest)} ~ {formatTime(latest)}</p>
      </div>

      {/* 위험도 바 */}
      <div className="bg-gray-50 rounded-2xl px-4 py-3.5 mb-3">
        <RiskBar score={riskScore} />
      </div>

      {/* 건조도 / 풍속 2열 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-2xl px-4 py-3">
          <p className="text-[10px] text-gray-500 mb-0.5">낙엽 건조도</p>
          <p className="text-sm font-bold text-gray-800">
            {medDryness}단계 · {DRYNESS_LABEL[medDryness]}
          </p>
        </div>
        <div className="bg-gray-50 rounded-2xl px-4 py-3">
          <p className="text-[10px] text-gray-500 mb-0.5">체감 풍속</p>
          <p className="text-sm font-bold text-gray-800">
            {medWind}단계 · {WIND_LABEL[medWind]}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ObservationSheet({ observation, onClose }) {
  const [viewerUrl, setViewerUrl] = useState(null)

  if (!observation) return null

  const isList = Array.isArray(observation)

  return (
    <>
      <Modal open={!!observation} onClose={onClose}>
        {isList ? (
          <>
            <SummaryCard observations={observation} />
            <PhotoThumbnails observations={observation} onSelect={setViewerUrl} />
          </>
        ) : (
          <SingleCard obs={observation} onPhotoClick={setViewerUrl} />
        )}
      </Modal>
      {viewerUrl && <PhotoViewer url={viewerUrl} onClose={() => setViewerUrl(null)} />}
    </>
  )
}
