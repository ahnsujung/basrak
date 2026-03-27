import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PageLayout from '@/components/layout/PageLayout'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'
import { useAuth } from '@/hooks/useAuth'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const { user, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, navigate, from])

  return (
    <PageLayout className="justify-center">
      <div className="flex flex-col items-center gap-2 mb-8">
        <span className="text-5xl">🍂</span>
        <h1 className="text-2xl font-bold text-gray-900">바스락</h1>
        <p className="text-sm text-gray-500">시민 산불 감시 플랫폼</p>
      </div>

      <div className="px-6">
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
    </PageLayout>
  )
}
