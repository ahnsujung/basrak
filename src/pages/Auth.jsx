import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PageLayout from '@/components/layout/PageLayout'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'
import { useAuth } from '@/hooks/useAuth'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const { user, signIn, signUp, signInWithKakao } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, navigate, from])

  return (
    <div className="min-h-dvh flex">
      {/* 브랜딩 패널 — 데스크톱 */}
      <div className="hidden lg:flex w-[480px] shrink-0 bg-brand flex-col items-center justify-center gap-3">
        <span className="text-7xl">🍂</span>
        <h1 className="text-3xl font-extrabold text-white tracking-widest">바스락</h1>
        <p className="text-sm text-white/50">시민과학 기반 산불위험 실시간 모니터링 플랫폼</p>
      </div>

      {/* 폼 영역 */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center px-5">
        <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm">
          {/* 모바일 브랜딩 */}
          <div className="flex flex-col items-center gap-2 mb-8 lg:hidden">
            <span className="text-5xl">🍂</span>
            <h1 className="typo-page-title">바스락</h1>
            <p className="text-sm text-gray-500">시민 산불 감시 플랫폼</p>
          </div>

          {/* 데스크톱 헤딩 */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-xl font-bold text-gray-900">
              {mode === 'login' ? '로그인' : '회원가입'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">계정 정보를 입력해 주세요</p>
          </div>

          {mode === 'login' ? (
            <LoginForm
              onSubmit={signIn}
              onSwitch={() => setMode('signup')}
            />
          ) : (
            <SignupForm
              onSubmit={signUp}
              onSwitch={() => setMode('login')}
            />
          )}
        </div>
      </div>
    </div>
  )
}
