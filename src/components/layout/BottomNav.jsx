import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: '지도', icon: '🗺️' },
  { to: '/observe', label: '관찰', icon: '🍂' },
  { to: '/profile', label: '나의 기여도', icon: '👤' },
]

export default function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-10 bg-white border-t border-gray-100 flex">
      {tabs.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors ${
              isActive ? 'text-green-700 font-medium' : 'text-gray-400'
            }`
          }
        >
          <span className="text-xl">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
