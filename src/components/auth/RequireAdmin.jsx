import { Navigate } from 'react-router-dom'
import { useAdmin } from '@/hooks/useAdmin'

export default function RequireAdmin({ children }) {
  const { isAdmin, loading, user } = useAdmin()

  if (loading) {
    return <div className="w-full max-w-lg min-h-dvh mx-auto bg-white" />
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}
