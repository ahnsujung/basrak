import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '@/components/layout/PageLayout'
import Spinner from '@/components/ui/Spinner'
import { Users, ChevronRight, AlertTriangle, BarChart3, Plus, Minus, Megaphone } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const RISK_COLOR = {
  high: 'bg-orange-500',
  critical: 'bg-red-500',
}

function riskLevel(score) {
  if (score >= 8) return { label: '매우 높음', color: RISK_COLOR.critical }
  if (score >= 6) return { label: '높음', color: RISK_COLOR.high }
  return null
}

const PROVINCES = [
  '서울', '인천', '대구', '광주', '대전', '울산', '부산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
]

const PROVINCE_BBOX = [
  { latMin: 37.43, latMax: 37.70, lngMin: 126.76, lngMax: 127.18 },
  { latMin: 37.25, latMax: 37.83, lngMin: 126.20, lngMax: 126.84 },
  { latMin: 35.67, latMax: 36.10, lngMin: 128.37, lngMax: 128.87 },
  { latMin: 35.03, latMax: 35.28, lngMin: 126.73, lngMax: 126.97 },
  { latMin: 36.20, latMax: 36.50, lngMin: 127.25, lngMax: 127.49 },
  { latMin: 35.43, latMax: 35.74, lngMin: 128.97, lngMax: 129.42 },
  { latMin: 34.87, latMax: 35.40, lngMin: 128.74, lngMax: 129.31 },
  { latMin: 36.40, latMax: 36.67, lngMin: 127.14, lngMax: 127.37 },
  { latMin: 36.90, latMax: 38.30, lngMin: 126.22, lngMax: 127.92 },
  { latMin: 37.00, latMax: 38.61, lngMin: 127.43, lngMax: 129.38 },
  { latMin: 36.10, latMax: 37.23, lngMin: 127.39, lngMax: 128.52 },
  { latMin: 35.87, latMax: 36.94, lngMin: 125.87, lngMax: 127.54 },
  { latMin: 35.22, latMax: 36.12, lngMin: 126.37, lngMax: 127.76 },
  { latMin: 33.90, latMax: 35.40, lngMin: 125.56, lngMax: 127.58 },
  { latMin: 35.67, latMax: 37.24, lngMin: 128.19, lngMax: 129.63 },
  { latMin: 34.70, latMax: 35.90, lngMin: 127.59, lngMax: 129.23 },
  { latMin: 33.10, latMax: 33.60, lngMin: 126.10, lngMax: 126.94 },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentObs, setRecentObs] = useState([])
  const [highRiskObs, setHighRiskObs] = useState([])
  const [regionData, setRegionData] = useState([])
  const [loading, setLoading] = useState(true)
  const [openSection, setOpenSection] = useState(null)

  const toggle = (key) => setOpenSection(prev => prev === key ? null : key)

  useEffect(() => {
    async function fetchAll() {
      const now = new Date()
      const todayKST = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
      const todayStart = todayKST + 'T00:00:00+09:00'
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const [
        { count: totalUsers },
        { count: totalObs },
        { count: todayObs },
        { count: weekObs },
        { data: todayUserData },
        { data: recent },
        { data: highRisk },
        ...provinceCounts
      ] = await Promise.all([
        // 기본 통계
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('observations').select('*', { count: 'exact', head: true }),
        supabase.from('observations').select('*', { count: 'exact', head: true })
          .gte('observed_at', todayStart),
        supabase.from('observations').select('*', { count: 'exact', head: true })
          .gte('observed_at', weekAgo),
        // 오늘 활성 사용자
        supabase.from('observations').select('user_id')
          .gte('observed_at', todayStart),
        // 최근 관측 10건
        supabase.from('observations')
          .select('id, lat, lng, dryness_level, wind_level, risk_score, photo_url, observed_at, user_id')
          .order('observed_at', { ascending: false })
          .limit(10),
        // 고위험 관측 (risk_score >= 8, 최근 7일)
        supabase.from('observations')
          .select('id, lat, lng, dryness_level, wind_level, risk_score, photo_url, observed_at')
          .gte('risk_score', 8)
          .gte('observed_at', weekAgo)
          .order('observed_at', { ascending: false })
          .limit(20),
        // 지역별 관측 수
        ...PROVINCE_BBOX.map(p =>
          supabase.from('observations').select('*', { count: 'exact', head: true })
            .gte('lat', p.latMin).lte('lat', p.latMax)
            .gte('lng', p.lngMin).lte('lng', p.lngMax)
        ),
      ])

      const activeUsers = new Set((todayUserData ?? []).map(o => o.user_id)).size

      const regions = PROVINCES.map((name, i) => ({
        name,
        count: provinceCounts[i].count ?? 0,
      })).sort((a, b) => b.count - a.count)

      setStats({ totalUsers, totalObs, todayObs, weekObs, activeUsers })
      setRecentObs(recent ?? [])
      setHighRiskObs(highRisk ?? [])
      setRegionData(regions)
      setLoading(false)
    }

    fetchAll()
  }, [])

  if (loading) {
    return (
      <PageLayout title="관리자 대시보드" sub className="items-center justify-center">
        <Spinner size="lg" />
      </PageLayout>
    )
  }

  const summaryCards = [
    { label: '전체 사용자', value: stats.totalUsers ?? 0, color: 'text-blue-600' },
    { label: '오늘 활성', value: stats.activeUsers ?? 0, color: 'text-teal-600' },
    { label: '전체 관측', value: stats.totalObs ?? 0, color: 'text-brand' },
    { label: '오늘 관측', value: stats.todayObs ?? 0, color: 'text-orange-500' },
    { label: '최근 7일', value: stats.weekObs ?? 0, color: 'text-purple-600' },
  ]

  const maxRegionCount = regionData[0]?.count || 1

  return (
    <PageLayout title="관리자 대시보드" sub className="gap-4 py-4 overflow-y-auto">
      {/* 요약 통계 */}
      <div className="grid grid-cols-2 gap-3">
        {summaryCards.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* 고위험 관측 */}
      {highRiskObs.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-3.5 pb-2">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-sm font-bold text-gray-900">고위험 관측</span>
            <span className="text-xs text-gray-400 ml-auto">최근 7일</span>
          </div>
          <div className="divide-y divide-gray-50">
            {highRiskObs.map((obs) => {
              const risk = riskLevel(obs.risk_score)
              const time = new Date(obs.observed_at).toLocaleString('ko-KR', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })
              return (
                <div key={obs.id} className="flex items-center gap-3 px-4 py-2.5">
                  {obs.photo_url ? (
                    <img src={obs.photo_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <span className="text-lg">🍂</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${risk.color}`} />
                      <span className="text-xs font-bold text-red-600">위험도 {obs.risk_score}</span>
                      <span className="text-[10px] text-gray-400">{risk.label}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      건조 {obs.dryness_level} · 바람 {obs.wind_level} · {time}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 아코디언 메뉴 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
        {/* 최근 관측 */}
        <div>
          <button
            onClick={() => toggle('recent')}
            className="w-full flex items-center justify-between px-4 py-3.5 active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg leading-none">🍂</span>
              <span className="text-sm font-semibold text-gray-800">최근 관측</span>
              <span className="text-xs text-gray-400">{recentObs.length}건</span>
            </div>
            {openSection === 'recent' ? <Minus size={16} className="text-gray-400" /> : <Plus size={16} className="text-gray-400" />}
          </button>
          {openSection === 'recent' && (
            <div className="divide-y divide-gray-50">
              {recentObs.map((obs) => {
                const time = new Date(obs.observed_at).toLocaleString('ko-KR', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })
                const scoreColor = obs.risk_score >= 8 ? 'text-red-600' : obs.risk_score >= 6 ? 'text-orange-500' : obs.risk_score >= 4 ? 'text-yellow-600' : 'text-green-600'
                return (
                  <div key={obs.id} className="flex items-center gap-3 px-4 py-2.5">
                    {obs.photo_url ? (
                      <img src={obs.photo_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <span className="text-lg">🍂</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700">
                        건조 {obs.dryness_level} · 바람 {obs.wind_level}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{time}</p>
                    </div>
                    <span className={`text-sm font-black ${scoreColor}`}>{obs.risk_score}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 지역별 관측 분포 */}
        <div>
          <button
            onClick={() => toggle('region')}
            className="w-full flex items-center justify-between px-4 py-3.5 active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BarChart3 size={18} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-800">지역별 관측 분포</span>
              <span className="text-xs text-gray-400">누적</span>
            </div>
            {openSection === 'region' ? <Minus size={16} className="text-gray-400" /> : <Plus size={16} className="text-gray-400" />}
          </button>
          {openSection === 'region' && (
            <div className="px-4 pb-4 pt-1 space-y-2">
              {regionData.map(({ name, count }) => (
                <div key={name} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-8 shrink-0">{name}</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all"
                      style={{ width: `${Math.max((count / maxRegionCount) * 100, count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 관리 메뉴 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
        <button
          onClick={() => navigate('/admin/users')}
          className="w-full flex items-center justify-between px-4 py-3.5 active:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Users size={18} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-800">사용자 관리</span>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </button>
        <button
          onClick={() => navigate('/admin/notices')}
          className="w-full flex items-center justify-between px-4 py-3.5 active:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Megaphone size={18} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-800">공지 관리</span>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </button>
      </div>
    </PageLayout>
  )
}
