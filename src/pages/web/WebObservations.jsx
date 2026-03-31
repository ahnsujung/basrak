import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getRiskLabel, getRiskColor } from '@/utils/riskCalculator'
import { Search, Download, X } from 'lucide-react'
import { WebTable } from '@/components/web/WebTable'

const PAGE_SIZE = 20
const DRYNESS = ['', '촉촉함', '구겨짐', '쪼개짐', '바스라짐']
const WIND = ['', '없음', '산들바람', '약한 바람', '보통 바람', '강한 바람', '매우 강함']

function formatDate(str) {
  const d = new Date(str)
  const y = String(d.getFullYear()).slice(2)
  const pad = (n) => String(n).padStart(2, '0')
  return `${y}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${pad(d.getHours())}/${pad(d.getMinutes())}`
}

const COLUMNS = [
  { key: 'idx', label: '#', width: 'w-[4%]', tdClass: 'text-gray-400', render: (r, meta) => meta.total - meta.offset },
  { key: 'photo', label: '사진', width: 'w-[5%]', render: (r) => r.photo_url ? (
    <img src={r.photo_url} alt="" className="w-10 h-10 rounded object-cover aspect-square" />
  ) : <span className="text-gray-300 text-xs">-</span> },
  { key: 'observed_at', label: '시간', width: 'w-[10%]', sortable: true, render: (r) => <span className="text-gray-700 whitespace-nowrap">{formatDate(r.observed_at)}</span> },
  { key: 'address', label: '주소', width: 'w-[20%]', render: (r) => <span className="text-gray-700">{r.address || '-'}</span> },
  { key: 'nickname', label: '관측자', width: 'w-[10%]', render: (r) => <span className="text-gray-700">{r.profiles?.nickname || '-'}</span> },
  { key: 'dryness_level', label: '건조도', width: 'w-[12%]', sortable: true, render: (r) => <><span className="text-gray-800">{r.dryness_level}단계</span><span className="text-gray-400 ml-1">{DRYNESS[r.dryness_level]}</span></> },
  { key: 'wind_level', label: '풍속', width: 'w-[12%]', sortable: true, render: (r) => <><span className="text-gray-800">{r.wind_level}단계</span><span className="text-gray-400 ml-1">{WIND[r.wind_level]}</span></> },
  { key: 'risk_score', label: '위험도', width: 'w-[5%]', sortable: true, render: (r) => (
    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getRiskColor(r.risk_score) }} title={`${r.risk_score}점`} />
  )},
  { key: 'coords', label: '좌표', width: 'w-[12%]', tdClass: 'text-gray-400 whitespace-nowrap', render: (r) => `${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}` },
]

export default function WebObservations() {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('')
  const [drynessFilter, setDrynessFilter] = useState('')
  const [windFilter, setWindFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState({ col: 'observed_at', asc: false })
  const [selected, setSelected] = useState(null)

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

    if (drynessFilter) query = query.eq('dryness_level', Number(drynessFilter))
    if (windFilter) query = query.eq('wind_level', Number(windFilter))

    if (dateFrom) query = query.gte('observed_at', new Date(dateFrom).toISOString())
    if (dateTo) query = query.lte('observed_at', new Date(dateTo + 'T23:59:59').toISOString())

    if (search.trim()) query = query.ilike('address', `%${search.trim()}%`)

    const { data, count } = await query
    setRows(data ?? [])
    setTotal(count ?? 0)
    setLoading(false)
  }, [page, sort, riskFilter, drynessFilter, windFilter, dateFrom, dateTo, search])

  useEffect(() => { fetchData() }, [fetchData])

  const toggleSort = (col) => {
    setSort(prev => ({ col, asc: prev.col === col ? !prev.asc : false }))
    setPage(0)
  }

  const handleExport = async () => {
    let query = supabase
      .from('observations')
      .select('id, lat, lng, dryness_level, wind_level, risk_score, photo_url, observed_at, address, user_id, profiles(nickname)')
      .order(sort.col, { ascending: sort.asc })
      .limit(5000)

    if (riskFilter === 'high') query = query.gte('risk_score', 8)
    else if (riskFilter === 'mid') query = query.gte('risk_score', 4).lte('risk_score', 7)
    else if (riskFilter === 'low') query = query.lte('risk_score', 3)
    if (drynessFilter) query = query.eq('dryness_level', Number(drynessFilter))
    if (windFilter) query = query.eq('wind_level', Number(windFilter))
    if (dateFrom) query = query.gte('observed_at', new Date(dateFrom).toISOString())
    if (dateTo) query = query.lte('observed_at', new Date(dateTo + 'T23:59:59').toISOString())
    if (search.trim()) query = query.ilike('address', `%${search.trim()}%`)

    const { data } = await query
    if (!data?.length) return

    const header = '순번,시간,주소,관측자,건조도,건조도명,풍속,풍속명,위험도,위험등급,위도,경도,사진URL'
    const csvRows = data.map((r, i) =>
      [
        data.length - i,
        new Date(r.observed_at).toLocaleString('ko-KR'),
        `"${(r.address || '').replace(/"/g, '""')}"`,
        `"${(r.profiles?.nickname || '').replace(/"/g, '""')}"`,
        r.dryness_level,
        DRYNESS[r.dryness_level],
        r.wind_level,
        WIND[r.wind_level],
        r.risk_score,
        getRiskLabel(r.risk_score),
        r.lat,
        r.lng,
        r.photo_url || '',
      ].join(',')
    )

    const bom = '\uFEFF'
    const blob = new Blob([bom + header + '\n' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `basrak_observations_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <header className="px-4 pt-6 pb-2">
        <h1 className="text-xl font-bold text-gray-900">관측 데이터</h1>
        <p className="text-xs text-gray-500 mt-1">전체 {total.toLocaleString()}건</p>
      </header>

      <div className="px-4 pb-4">
        {/* 필터 카드 */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                placeholder="주소 검색"
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md outline-none focus:border-brand-light"
              />
            </div>
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(0) }} className="text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none focus:border-brand-light" />
            <span className="text-xs text-gray-400">~</span>
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(0) }} className="text-xs border border-gray-200 rounded-md px-2 py-1.5 outline-none focus:border-brand-light" />
            <select value={drynessFilter} onChange={(e) => { setDrynessFilter(e.target.value); setPage(0) }} className="text-xs border border-gray-200 rounded-md px-2.5 py-1.5 outline-none focus:border-brand-light">
              <option value="">전체 건조도</option>
              <option value="1">1단계 촉촉함</option>
              <option value="2">2단계 구겨짐</option>
              <option value="3">3단계 쪼개짐</option>
              <option value="4">4단계 바스라짐</option>
            </select>
            <select value={windFilter} onChange={(e) => { setWindFilter(e.target.value); setPage(0) }} className="text-xs border border-gray-200 rounded-md px-2.5 py-1.5 outline-none focus:border-brand-light">
              <option value="">전체 풍속</option>
              <option value="1">1단계 없음</option>
              <option value="2">2단계 산들바람</option>
              <option value="3">3단계 약한 바람</option>
              <option value="4">4단계 보통 바람</option>
              <option value="5">5단계 강한 바람</option>
              <option value="6">6단계 매우 강함</option>
            </select>
            <select value={riskFilter} onChange={(e) => { setRiskFilter(e.target.value); setPage(0) }} className="text-xs border border-gray-200 rounded-md px-2.5 py-1.5 outline-none focus:border-brand-light">
              <option value="">전체 위험도</option>
              <option value="low">낮음 (1~3)</option>
              <option value="mid">보통~높음 (4~7)</option>
              <option value="high">매우 높음 (8~10)</option>
            </select>
            <button
              onClick={handleExport}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors ml-auto"
            >
              <Download size={12} />
              CSV
            </button>
          </div>
        </div>

        <WebTable columns={COLUMNS} rows={rows} loading={loading} sort={sort} onSort={toggleSort} page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} onRowClick={setSelected} />
      </div>

      {/* 상세 모달 */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">관측 상세</h3>
              <button onClick={() => setSelected(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            {/* 사진 */}
            <div className="mx-5 mt-4 h-48 bg-gray-100 rounded-lg overflow-hidden">
              {selected.photo_url ? (
                <img src={selected.photo_url} alt="관측 사진" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">사진 없음</div>
              )}
            </div>

            {/* 정보 */}
            <div className="px-5 py-4">
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: getRiskColor(selected.risk_score) }} />
                  <span className="text-gray-900">{getRiskLabel(selected.risk_score)}</span>
                  <span className="text-xs text-gray-400">{selected.risk_score}점</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[11px] text-gray-400">건조도</p>
                    <p className="text-gray-800">{selected.dryness_level}단계 · {DRYNESS[selected.dryness_level]}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">풍속</p>
                    <p className="text-gray-800">{selected.wind_level}단계 · {WIND[selected.wind_level]}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">관측자</p>
                    <p className="text-gray-800">{selected.profiles?.nickname || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">시간</p>
                    <p className="text-gray-800">{formatDate(selected.observed_at)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">주소</p>
                  <p className="text-gray-800">{selected.address || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">좌표</p>
                  <p className="text-gray-800">{selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
