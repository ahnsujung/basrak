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
    <div className="min-h-dvh bg-gray-50 flex items-center justify-center px-5">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <span className="text-5xl">🍂</span>
          <h1 className="typo-page-title">바스락</h1>
          <p className="text-sm text-gray-500">시민 산불 감시 플랫폼</p>
        </div>

        {/* 카카오 로그인 — 비즈앱 심사 완료 후 활성화
        <button
          onClick={signInWithKakao}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium transition-colors"
          style={{ backgroundColor: '#FEE500', color: '#191919' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#191919">
            <path d="M12 3C6.48 3 2 6.36 2 10.44c0 2.63 1.76 4.95 4.4 6.27-.14.52-.9 3.34-.93 3.56 0 0-.02.16.08.22.1.06.22.03.22.03.29-.04 3.37-2.2 3.9-2.57.75.11 1.53.17 2.33.17 5.52 0 10-3.36 10-7.68S17.52 3 12 3"/>
          </svg>
          카카오로 시작하기
        </button>

        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">또는</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        */}

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
  )
}
