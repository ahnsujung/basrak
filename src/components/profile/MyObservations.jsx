import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import { getRiskLabel } from '@/utils/riskCalculator'
import { useMyObservations } from '@/hooks/useMyObservations'

const PROVINCES = [
  { name: '서울', latMin: 37.43, latMax: 37.70, lngMin: 126.76, lngMax: 127.18 },
  { name: '인천', latMin: 37.25, latMax: 37.83, lngMin: 126.20, lngMax: 126.84 },
  { name: '대구', latMin: 35.67, latMax: 36.10, lngMin: 128.37, lngMax: 128.87 },
  { name: '광주', latMin: 35.03, latMax: 35.28, lngMin: 126.73, lngMax: 126.97 },
  { name: '대전', latMin: 36.20, latMax: 36.50, lngMin: 127.25, lngMax: 127.49 },
  { name: '울산', latMin: 35.43, latMax: 35.74, lngMin: 128.97, lngMax: 129.42 },
  { name: '부산', latMin: 34.87, latMax: 35.40, lngMin: 128.74, lngMax: 129.31 },
  { name: '세종', latMin: 36.40, latMax: 36.67, lngMin: 127.14, lngMax: 127.37 },
  { name: '경기', latMin: 36.90, latMax: 38.30, lngMin: 126.22, lngMax: 127.92 },
  { name: '강원', latMin: 37.00, latMax: 38.61, lngMin: 127.43, lngMax: 129.38 },
  { name: '충북', latMin: 36.10, latMax: 37.23, lngMin: 127.39, lngMax: 128.52 },
  { name: '충남', latMin: 35.87, latMax: 36.94, lngMin: 125.87, lngMax: 127.54 },
  { name: '전북', latMin: 35.22, latMax: 36.12, lngMin: 126.37, lngMax: 127.76 },
  { name: '전남', latMin: 33.90, latMax: 35.40, lngMin: 125.56, lngMax: 127.58 },
  { name: '경북', latMin: 35.67, latMax: 37.24, lngMin: 128.19, lngMax: 129.63 },
  { name: '경남', latMin: 34.70, latMax: 35.90, lngMin: 127.59, lngMax: 129.23 },
  { name: '제주', latMin: 33.10, latMax: 33.60, lngMin: 126.10, lngMax: 126.94 },
]

function getProvinceName(lat, lng) {
  const p = PROVINCES.find(p => lat >= p.latMin && lat <= p.latMax && lng >= p.lngMin && lng <= p.lngMax)
  return p ? p.name : null
}

const RISK_VARIANT = (score) => {
  if (score <= 3) return 'green'
  if (score <= 5) return 'yellow'
  if (score <= 7) return 'orange'
  return 'red'
}

export default function MyObservations({ userId }) {
  const { observations, loading, error } = useMyObservations(userId)

  if (loading) return <div className="flex justify-center py-6"><Spinner /></div>
  if (error) return <p className="text-sm text-red-500 text-center py-6">{error}</p>
  if (!observations.length) return <p className="text-sm text-gray-400 text-center py-6">관측 이력이 없습니다</p>

  return (
    <div className="flex flex-col">
      {observations.map((obs) => (
        <div key={obs.id} className="flex items-center gap-3 py-3.5 border-b border-gray-100 last:border-0">
          {obs.photo_url ? (
            <img src={obs.photo_url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🍂</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Badge variant={RISK_VARIANT(obs.risk_score)}>
                {getRiskLabel(obs.risk_score)}
              </Badge>
              <span className="text-xs text-gray-400">건조 {obs.dryness_level} · 풍속 {obs.wind_level}</span>
            </div>
            <p className="text-xs text-gray-400">
              {(obs.address || getProvinceName(obs.lat, obs.lng)) && (
                <span className="text-gray-500 font-medium">{obs.address || getProvinceName(obs.lat, obs.lng)} · </span>
              )}
              {new Date(obs.observed_at).toLocaleDateString('ko-KR', {
                month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
