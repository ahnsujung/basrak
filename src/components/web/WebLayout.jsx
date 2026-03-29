import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Database, Users, Megaphone, BarChart3, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const NAV_ITEMS = [
  { to: '/web', icon: LayoutDashboard, label: '대시보드', end: true },
  { to: '/web/observations', icon: Database, label: '관측 데이터' },
  { to: '/web/users', icon: Users, label: '사용자 관리' },
  { to: '/web/notices', icon: Megaphone, label: '공지 관리' },
  { to: '/web/index', icon: BarChart3, label: '바스락 지수' },
]

export default function WebLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <div className="flex h-screen min-w-[1200px] bg-gray-50">
      {/* 사이드바 */}
      <aside className="w-[280px] h-full bg-white border-r border-gray-200 flex flex-col shrink-0">
        {/* 헤더 */}
        <div className="h-16 flex items-baseline gap-2 px-6 bg-brand shrink-0" style={{ alignItems: 'center' }}>
          <span className="text-xl font-extrabold text-white tracking-widest">바스락</span>
          <span className="text-xs text-white/50 font-medium">관리자 콘솔</span>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-brand text-white font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.5} />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* 푸터 */}
        <div className="border-t border-gray-100 px-4 py-3">
          <p className="text-xs text-gray-400 truncate mb-2">{user?.email}</p>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <LogOut size={14} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
