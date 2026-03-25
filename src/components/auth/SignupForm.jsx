import { useState } from 'react'

export default function SignupForm({ onSubmit, onSwitch }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onSubmit(email, password)
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
        <span className="text-4xl">📧</span>
        <p className="text-gray-700 font-medium">가입 완료!</p>
        <p className="text-sm text-gray-500">
          {email}로 인증 메일을 보냈습니다.<br />메일 확인 후 로그인하세요.
        </p>
        <button onClick={onSwitch} className="text-sm text-green-700 underline">
          로그인으로 이동
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-600 transition-colors"
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
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-600 transition-colors"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-green-700 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50 transition-opacity"
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
    </form>
  )
}
