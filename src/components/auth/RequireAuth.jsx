import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (user === undefined) {
    // 세션 로딩 중 — 빈 화면 (깜빡임 방지)
    return <div className="w-full max-w-[430px] min-h-dvh mx-auto bg-white" />
  }

  if (user === null) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />
  }

  return children
}
