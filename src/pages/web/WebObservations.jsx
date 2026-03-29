import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getRiskLabel, getRiskColor } from '@/utils/riskCalculator'
import { Search, ExternalLink } from 'lucide-react'
import { WebTable, WebPagination } from '@/components/web/WebTable'

const PAGE_SIZE = 20
const DRYNESS = ['', '촉촉함', '구겨짐', '쪼개짐', '바스라짐']
const WIND = ['', '없음', '산들바람', '약한 바람', '보통 바람', '강한 바람', '매우 강함']

function formatDate(str) {
  return new Date(str).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

const COLUMNS = [
  { key: 'observed_at', label: '시간', width: 'w-[14%]', sortable: true, render: (r) => <span className="text-gray-700 whitespace-nowrap">{formatDate(r.observed_at)}</span> },
  { key: 'address', label: '주소', width: 'w-[22%]', render: (r) => <span className="text-gray-700">{r.address || '-'}</span> },
  { key: 'nickname', label: '관측자', width: 'w-[10%]', render: (r) => <span className="text-gray-700">{r.profiles?.nickname || '-'}</span> },
  { key: 'dryness_level', label: '건조도', width: 'w-[12%]', sortable: true, render: (r) => <><span className="text-gray-800">{r.dryness_level}단계</span><span className="text-gray-400 ml-1">{DRYNESS[r.dryness_level]}</span></> },
  { key: 'wind_level', label: '풍속', width: 'w-[12%]', sortable: true, render: (r) => <><span className="text-gray-800">{r.wind_level}단계</span><span className="text-gray-400 ml-1">{WIND[r.wind_level]}</span></> },
  { key: 'risk_score', label: '위험도', width: 'w-[10%]', sortable: true, render: (r) => (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: getRiskColor(r.risk_score) }}>
      {r.risk_score} · {getRiskLabel(r.risk_score)}
    </span>
  )},
  { key: 'photo', label: '사진', width: 'w-[6%]', render: (r) => r.photo_url ? (
    <a href={r.photo_url} target="_blank" rel="noopener noreferrer" className="text-brand-light hover:underline flex items-center gap-0.5">보기 <ExternalLink size={12} /></a>
  ) : <span className="text-gray-300">-</span> },
  { key: 'coords', label: '좌표', width: 'w-[14%]', tdClass: 'text-gray-400 whitespace-nowrap', render: (r) => `${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}` },
]

export default function WebObservations() {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('')
  const [sort, setSort] = useState({ col: 'observed_at', asc: false })

  const fetchData = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('observations')
      .select('id, lat, lng, dryness_level, wind_level, risk_score, photo_url, observed_at, address, user_id, profiles(nickname)', { count: 'exact' })
      .order(sort.col, { ascending: sort.asc })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (riskFilter === 'high') query = query.gte('risk_score', 8)
    else if (riskFilter === 'mid') query = query.gte('risk_score', 4).lte('risk_score', 7)
    else if (riskFilter === 'low') query = query.lte('risk_score', 3)

    if (search.trim()) query = query.ilike('address', `%${search.trim()}%`)

    const { data, count } = await query
    setRows(data ?? [])
    setTotal(count ?? 0)
    setLoading(false)
  }, [page, sort, riskFilter, search])

  useEffect(() => { fetchData() }, [fetchData])

  const toggleSort = (col) => {
    setSort(prev => ({ col, asc: prev.col === col ? !prev.asc : false }))
    setPage(0)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div>
      <header className="px-4 pt-6 pb-2 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">관측 데이터</h1>
          <p className="text-xs text-gray-500 mt-1">전체 {total.toLocaleString()}건</p>
        </div>
        <WebPagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </header>

      <div className="px-4 pb-4">
        {/* 필터 바 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              placeholder="주소 검색"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-brand-light"
            />
          </div>
          <select
            value={riskFilter}
            onChange={(e) => { setRiskFilter(e.target.value); setPage(0) }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-brand-light"
          >
            <option value="">전체 위험도</option>
            <option value="low">낮음 (1~3)</option>
            <option value="mid">보통~높음 (4~7)</option>
            <option value="high">매우 높음 (8~10)</option>
          </select>
        </div>

        <WebTable columns={COLUMNS} rows={rows} loading={loading} sort={sort} onSort={toggleSort} />
      </div>
    </div>
  )
}
