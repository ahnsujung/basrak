import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { getRiskLabel, getRiskColor } from '@/utils/riskCalculator'
import { median } from '@/utils/median'

const RISK_VARIANT = (score) => {
  if (score <= 3) return 'green'
  if (score <= 5) return 'yellow'
  if (score <= 7) return 'orange'
  return 'red'
}

const DRYNESS_LABEL = ['', '촉촉함', '구겨짐', '쪼개짐', '바스라짐']
const WIND_LABEL = ['', '바람 없음', '산들바람', '약한 바람', '보통 바람', '강한 바람', '매우 강한 바람']

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function SingleCard({ obs, onPhotoClick }) {
  const { dryness_level, wind_level, risk_score, photo_url, observed_at } = obs
  const color = getRiskColor(risk_score)

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-full flex-shrink-0 border-2 border-white shadow"
          style={{ backgroundColor: color }}
        />
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={RISK_VARIANT(risk_score)}>{getRiskLabel(risk_score)}</Badge>
            <span className="text-sm font-semibold text-gray-700">위험도 {risk_score}점</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{formatTime(observed_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-xl px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">낙엽 건조도</p>
          <p className="text-sm font-semibold text-gray-800">
            단계 {dryness_level} · {DRYNESS_LABEL[dryness_level]}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">체감 풍속</p>
          <p className="text-sm font-semibold text-gray-800">
            단계 {wind_level} · {WIND_LABEL[wind_level]}
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

function MedianBar({ labels, value, min, max, gradient }) {
  const steps = labels.length
  const pct = ((value - 1) / (steps - 1)) * 100
  return (
    <div>
      <div className="relative mt-8 mb-2">
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

function SummaryCard({ observations }) {
  const count = observations.length
  const sorted = [...observations].sort((a, b) => new Date(a.observed_at) - new Date(b.observed_at))
  const earliest = sorted[0].observed_at
  const latest = sorted[sorted.length - 1].observed_at

  const medDryness = median(observations.map(o => o.dryness_level))
  const medWind = median(observations.map(o => o.wind_level))
  const minDryness = Math.min(...observations.map(o => o.dryness_level))
  const maxDryness = Math.max(...observations.map(o => o.dryness_level))
  const minWind = Math.min(...observations.map(o => o.wind_level))
  const maxWind = Math.max(...observations.map(o => o.wind_level))

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full flex-shrink-0 bg-brand/10 flex items-center justify-center">
          <span className="text-brand text-sm font-bold">{count}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">이 지역 관측</p>
          <p className="text-xs text-gray-400 mt-0.5">{count}건 · {formatTime(earliest)} ~ {formatTime(latest)}</p>
        </div>
      </div>

      {/* 건조도 */}
      <div className="bg-gray-50 rounded-2xl px-4 py-3.5 mb-2">
        <p className="text-sm font-bold text-gray-800">건조도</p>
        <MedianBar
          labels={['촉촉함', '구겨짐', '쪼개짐', '바스라짐']}
          value={medDryness}
          min={minDryness}
          max={maxDryness}
          gradient="linear-gradient(to right, #E8D5B7, #C4A26E, #9B7740, #6B4E2A)"
        />
      </div>

      {/* 풍속 */}
      <div className="bg-gray-50 rounded-2xl px-4 py-3.5">
        <p className="text-sm font-bold text-gray-800">풍속</p>
        <MedianBar
          labels={['없음', '산들', '약함', '보통', '강함', '매우강']}
          value={medWind}
          min={minWind}
          max={maxWind}
          gradient="linear-gradient(to right, #B8D4E8, #7EB3D4, #4A90BD, #2968A0, #1A4E82, #0D3566)"
        />
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
