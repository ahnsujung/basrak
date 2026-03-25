import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RequireAuth from '@/components/auth/RequireAuth'
import Home from '@/pages/Home'
import Observe from '@/pages/Observe'
import Profile from '@/pages/Profile'
import Auth from '@/pages/Auth'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/observe" element={<RequireAuth><Observe /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
