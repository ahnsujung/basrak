import { useState } from 'react'
import { Mail, Check, ChevronRight } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { TERMS_SERVICE, TERMS_PRIVACY, TERMS_LOCATION } from '@/constants/terms'

const AGREEMENTS = [
  { key: 'service', label: '서비스 이용약관', content: TERMS_SERVICE },
  { key: 'privacy', label: '개인정보 수집·이용 동의', content: TERMS_PRIVACY },
  { key: 'location', label: '위치정보 이용약관 동의', content: TERMS_LOCATION },
]

export default function SignupForm({ onSubmit, onSwitch }) {
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [agreed, setAgreed] = useState({ service: false, privacy: false, location: false })
  const [viewTerm, setViewTerm] = useState(null)

  const allAgreed = agreed.service && agreed.privacy && agreed.location

  const toggleAll = () => {
    const next = !allAgreed
    setAgreed({ service: next, privacy: next, location: next })
  }

  const toggle = (key) => setAgreed((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!allAgreed) { setError('필수 약관에 모두 동의해 주세요'); return }
    const trimmed = nickname.trim()
    if (trimmed.length < 2) { setError('닉네임은 2자 이상 입력해 주세요'); return }
    setError('')
    setLoading(true)
    try {
      await onSubmit(email, password, trimmed)
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <Mail size={40} className="text-brand" />
        <p className="text-gray-700 font-medium">가입 완료!</p>
        <p className="text-sm text-gray-500">
          {email}로 인증 메일을 보냈습니다.<br />메일 확인 후 로그인하세요.
        </p>
        <button onClick={onSwitch} className="text-sm text-brand underline">
          로그인으로 이동
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">닉네임</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="2~12자"
          maxLength={12}
          required
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-brand-light focus:bg-white transition-colors"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-brand-light focus:bg-white transition-colors"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="6자 이상"
          minLength={6}
          required
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-brand-light focus:bg-white transition-colors"
        />
      </div>
      {/* 약관 동의 */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {/* 전체 동의 */}
        <button
          type="button"
          onClick={toggleAll}
          className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50"
        >
          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
            allAgreed ? 'bg-brand-light' : 'border-2 border-gray-300'
          }`}>
            {allAgreed && <Check size={14} className="text-white" strokeWidth={2.5} />}
          </div>
          <span className="text-sm font-bold text-gray-800">전체 동의</span>
        </button>

        <div className="divide-y divide-gray-100">
          {AGREEMENTS.map(({ key, label, content }) => (
            <div key={key} className="flex items-center px-4 py-2.5">
              <button
                type="button"
                onClick={() => toggle(key)}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                  agreed[key] ? 'bg-brand-light' : 'border-2 border-gray-300'
                }`}>
                  {agreed[key] && <Check size={14} className="text-white" strokeWidth={2.5} />}
                </div>
                <span className="text-xs text-gray-600">[필수] {label}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewTerm(content)}
                className="p-1 text-gray-400"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading || !allAgreed}
        className="bg-brand-light text-white rounded-2xl shadow-md py-3.5 text-sm font-medium disabled:opacity-50 transition-opacity"
      >
        {loading ? '가입 중...' : '회원가입'}
      </button>
      <button
        type="button"
        onClick={onSwitch}
        className="text-sm text-gray-500 underline"
      >
        이미 계정이 있으신가요? 로그인
      </button>

      {/* 약관 상세 모달 */}
      <Modal open={!!viewTerm} onClose={() => setViewTerm(null)}>
        <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{viewTerm}</p>
        <button
          type="button"
          onClick={() => setViewTerm(null)}
          className="w-full mt-4 bg-brand-light text-white rounded-2xl shadow-md py-3 text-sm font-medium"
        >
          확인
        </button>
      </Modal>
    </form>
  )
}
