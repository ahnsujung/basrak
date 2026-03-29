import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import InstallBanner from '@/components/pwa/InstallBanner'
import RequireAuth from '@/components/auth/RequireAuth'
import RequireAdmin from '@/components/auth/RequireAdmin'
import Home from '@/pages/Home'
import Observe from '@/pages/Observe'
import Profile from '@/pages/Profile'
import Auth from '@/pages/Auth'
import MapTest from '@/pages/MapTest'
import About from '@/pages/About'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminNotices from '@/pages/admin/AdminNotices'
import WebLayout from '@/components/web/WebLayout'
import WebDashboard from '@/pages/web/WebDashboard'
import WebObservations from '@/pages/web/WebObservations'
import WebUsers from '@/pages/web/WebUsers'
import WebNotices from '@/pages/web/WebNotices'
import WebIndex from '@/pages/web/WebIndex'

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <InstallBanner />
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Home />} />
          <Route path="/observe" element={<Observe />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/admin_mobile" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="/admin_mobile/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
          <Route path="/admin_mobile/notices" element={<RequireAdmin><AdminNotices /></RequireAdmin>} />
          <Route path="/dev/map-test" element={<MapTest />} />
          <Route path="/admin_web" element={<RequireAdmin><WebLayout /></RequireAdmin>}>
            <Route index element={<WebDashboard />} />
            <Route path="observations" element={<WebObservations />} />
            <Route path="users" element={<WebUsers />} />
            <Route path="notices" element={<WebNotices />} />
            <Route path="index" element={<WebIndex />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
