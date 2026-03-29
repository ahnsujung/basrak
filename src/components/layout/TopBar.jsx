import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ChevronLeft, UserCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import LevelBadge from '@/components/profile/LevelBadge'

export default function TopBar({ title, right, sub = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { profile } = useProfile(user?.id)
  const mainTabs = ['/', '/observe', '/about']
  const isHome = mainTabs.includes(location.pathname)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const el = document.getElementById('app-scroll')
    if (!el) return
    const handler = () => setScrolled(el.scrollTop > 40)
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [])

  // 하위 페이지: 흰색 헤더 + 중앙 타이틀 + 뒤로가기
  if (sub) {
    return (
      <header className="sticky top-0 z-20 shrink-0 h-12 bg-white border-b border-gray-100">
        <div className="h-full flex items-center px-4 relative">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-600 hover:text-gray-900">
            <ChevronLeft size={22} />
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 text-sm font-bold text-gray-900">
            {title}
          </span>
        </div>
      </header>
    )
  }

  return (
    <header
      className={`sticky top-0 z-20 shrink-0 transition-all duration-300 ${
        scrolled
          ? 'h-12 bg-brand/90 backdrop-blur-md shadow-md'
          : 'h-16 bg-brand'
      }`}
    >
      <div className="h-full flex items-center px-4">
        {/* 좌측: 뒤로가기 또는 앱명 */}
        {!isHome ? (
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-white/80 hover:text-white mr-2">
            <ChevronLeft size={22} />
          </button>
        ) : null}

        <div className="flex-1 min-w-0">
          {isHome ? (
            <div className={`flex items-baseline gap-2 transition-all duration-300 ${scrolled ? 'gap-1.5' : ''}`}>
              <span className={`font-extrabold text-white tracking-widest transition-all duration-300 ${
                scrolled ? 'text-base' : 'text-xl'
              }`}>
                바스락
              </span>
              <span className={`text-white/50 font-medium transition-all duration-300 ${
                scrolled ? 'text-[10px]' : 'text-xs'
              }`}>
                시민 산불 감시 플랫폼
              </span>
            </div>
          ) : (
            <span className={`font-bold text-white truncate transition-all duration-300 ${
              scrolled ? 'text-sm' : 'text-base'
            }`}>
              {title}
            </span>
          )}
        </div>

        {/* 우측: 프로필 + 액션 */}
        <div className="shrink-0 flex items-center gap-2">
          {right}
          <button
            onClick={() => navigate(user ? '/profile' : '/auth')}
            className="p-1 text-white/70 hover:text-white transition-colors"
          >
            {profile ? (
              <LevelBadge points={profile.total_points ?? 0} size="sm" />
            ) : (
              <UserCircle size={scrolled ? 22 : 26} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
