import { NavLink } from 'react-router-dom'
import { Home, Info } from 'lucide-react'

const tabs = [
  { to: '/', label: '홈', Icon: Home },
  { to: '/observe', label: '관찰', emoji: '🍂' },
  { to: '/about', label: '소개', Icon: Info },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-[calc(var(--container-max,32rem)-2rem)] rounded-2xl bg-gray-100/80 backdrop-blur-xl shadow-sm flex">
      {tabs.map(({ to, label, Icon, emoji }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[11px] transition-colors ${
              isActive ? 'text-brand font-semibold' : 'text-gray-400'
            }`
          }
        >
          {Icon ? <Icon size={22} strokeWidth={1.8} /> : <span className="text-xl leading-none">{emoji}</span>}
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
