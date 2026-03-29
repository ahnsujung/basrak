import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, Upload, Download, Shield, X } from 'lucide-react'
import { TERMS_SERVICE, TERMS_PRIVACY, TERMS_LOCATION } from '@/constants/terms'

const DEFAULT_CONFIG = {
  copyright: '국립산림과학원 · 바스락 프로젝트',
  terms_service: '',
  terms_privacy: '',
  terms_location: '',
  dryness_photos: ['', '', '', ''],
  onboarding_text: '시민과학 기반 산불위험 실시간 모니터링 플랫폼',
}

function parseCsv(text) {
  const lines = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') { inQuotes = !inQuotes; continue }
    if (ch === '\n' && !inQuotes) { lines.push(current); current = ''; continue }
    current += ch
  }
  if (current) lines.push(current)

  // 헤더 제거, 각 행의 첫번째 콤마 이후가 내용
  return lines.slice(1).map(line => {
    const idx = line.indexOf(',')
    const key = line.slice(0, idx)
    const val = line.slice(idx + 1)
    return `${key}\n${val}`
  }).join('\n\n')
}

function TermsSection({ label, value, onChange, placeholder, sampleFile }) {
  const fileRef = useRef(null)

  const handleUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      onChange(parseCsv(reader.result))
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-gray-500">{label}</label>
        <div className="flex items-center gap-2">
          <a href={sampleFile} download className="flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-gray-600">
            <Download size={10} /> 샘플
          </a>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-0.5 text-[10px] text-brand-light hover:text-brand-light-hover"
          >
            <Upload size={10} /> CSV 업로드
          </button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleUpload} />
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-brand-light resize-none"
        placeholder={placeholder}
      />
    </div>
  )
}

function AdminManager() {
  const [admins, setAdmins] = useState([])
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const fetchAdmins = async () => {
    const { data } = await supabase.rpc('get_admin_list')
    setAdmins(data ?? [])
  }

  useEffect(() => { fetchAdmins() }, [])

  const handleAdd = async () => {
    setError('')
    const trimmed = email.trim()
    if (!trimmed) return

    // 이메일로 유저 ID 조회
    const { data: userId } = await supabase.rpc('get_user_id_by_email', { user_email: trimmed })
    if (!userId) {
      setError('해당 이메일의 사용자를 찾을 수 없습니다')
      return
    }

    // 이미 관리자인지 확인
    if (admins.some(a => a.id === userId)) {
      setError('이미 관리자로 등록된 사용자입니다')
      return
    }

    await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId)
    setEmail('')
    fetchAdmins()
  }

  const handleRemove = async (id) => {
    if (!confirm('관리자 권한을 해제하시겠습니까?')) return
    await supabase.from('profiles').update({ role: null }).eq('id', id)
    fetchAdmins()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">관리자 등록</h3>

      {/* 현재 관리자 목록 */}
      <div className="space-y-2 mb-3">
        {admins.map((a) => (
          <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-brand" />
              <span className="text-sm text-gray-800">{a.nickname || '-'}</span>
              <span className="text-xs text-gray-400">{a.email}</span>
            </div>
            <button onClick={() => handleRemove(a.id)} className="text-gray-400 hover:text-red-500 transition-colors">
              <X size={14} />
            </button>
          </div>
        ))}
        {admins.length === 0 && <p className="text-xs text-gray-400">등록된 관리자가 없습니다</p>}
      </div>

      {/* 추가 */}
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="관리자로 등록할 이메일"
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-brand-light"
        />
        <button
          onClick={handleAdd}
          className="text-xs bg-brand-light text-white rounded-lg px-3 py-2 hover:bg-brand-light-hover transition-colors"
        >
          추가
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <p className="text-[10px] text-gray-400 mt-2">가입된 사용자의 이메일을 입력하세요. 관리자는 어드민 페이지에 접근할 수 있습니다.</p>
    </div>
  )
}

export default function WebSettings() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('app_config').select('key, value').then(({ data }) => {
      if (!data) return
      const loaded = { ...DEFAULT_CONFIG }
      data.forEach(({ key, value }) => {
        if (key in loaded) loaded[key] = typeof loaded[key] === 'string' ? value : JSON.parse(value)
      })
      setConfig(loaded)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const entries = Object.entries(config).map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value),
    }))

    for (const entry of entries) {
      await supabase.from('app_config').upsert(entry, { onConflict: 'key' })
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateField = (key, value) => setConfig(prev => ({ ...prev, [key]: value }))

  const updateDrynessPhoto = (idx, value) => {
    setConfig(prev => {
      const photos = [...prev.dryness_photos]
      photos[idx] = value
      return { ...prev, dryness_photos: photos }
    })
  }

  return (
    <div>
      <header className="px-4 pt-6 pb-2 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">앱 관리</h1>
          <p className="text-xs text-gray-500 mt-1">앱 텍스트, 이미지, 약관 등을 관리합니다</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 text-xs bg-brand-light text-white rounded-lg px-3 py-2 hover:bg-brand-light-hover disabled:opacity-50 transition-colors"
        >
          <Save size={13} />
          {saving ? '저장 중...' : saved ? '저장됨' : '저장'}
        </button>
      </header>

      <div className="px-4 pb-4 space-y-4">
        {/* 관리자 등록 */}
        <AdminManager />

        {/* 기본 정보 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">기본 정보</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">카피라이트</label>
              <input
                type="text"
                value={config.copyright}
                onChange={(e) => updateField('copyright', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-brand-light"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">온보딩 소개 텍스트</label>
              <input
                type="text"
                value={config.onboarding_text}
                onChange={(e) => updateField('onboarding_text', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-brand-light"
              />
            </div>
          </div>
        </div>

        {/* 건조도 참고 사진 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">건조도 참고 사진 URL</h3>
          <div className="grid grid-cols-2 gap-3">
            {['촉촉함', '구겨짐', '쪼개짐', '바스라짐'].map((label, i) => (
              <div key={i}>
                <label className="text-xs text-gray-500 mb-1 block">{i + 1}단계 · {label}</label>
                <input
                  type="text"
                  value={config.dryness_photos[i]}
                  onChange={(e) => updateDrynessPhoto(i, e.target.value)}
                  placeholder="이미지 URL"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-brand-light"
                />
                {config.dryness_photos[i] && (
                  <img src={config.dryness_photos[i]} alt={label} className="w-full h-24 object-cover rounded-lg mt-1" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 약관 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">약관 관리</h3>
          <div className="space-y-4">
            <TermsSection
              label="서비스 이용약관"
              value={config.terms_service}
              onChange={(v) => updateField('terms_service', v)}
              placeholder={TERMS_SERVICE}
              sampleFile="/_DEV/samples/terms_service.csv"
            />
            <TermsSection
              label="개인정보 수집·이용 동의"
              value={config.terms_privacy}
              onChange={(v) => updateField('terms_privacy', v)}
              placeholder={TERMS_PRIVACY}
              sampleFile="/samples/terms_privacy.csv"
            />
            <TermsSection
              label="위치정보 이용약관"
              value={config.terms_location}
              onChange={(v) => updateField('terms_location', v)}
              placeholder={TERMS_LOCATION}
              sampleFile="/samples/terms_location.csv"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
