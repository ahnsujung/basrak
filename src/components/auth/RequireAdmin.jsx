import { Navigate, useLocation } from 'react-router-dom'
import { useAdmin } from '@/hooks/useAdmin'

export default function RequireAdmin({ children }) {
  const { isAdmin, loading, user } = useAdmin()
  const location = useLocation()

  if (loading) {
    return <div className="w-full max-w-lg min-h-dvh mx-auto bg-white" />
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}
