import TopBar from './TopBar'
import BottomNav from './BottomNav'

export default function PageLayout({ children, title, topRight, hideNav = false, sub = false, fullWidth = false, className = '' }) {
  const showNav = !hideNav && !sub
  return (
    <div className={`w-full max-w-lg min-h-dvh mx-auto relative overflow-x-hidden flex flex-col ${fullWidth ? 'bg-white' : 'bg-gray-50'}`} style={{ '--container-max': '32rem' }}>
      {sub ? (
        <TopBar title={title} sub />
      ) : (
        !hideNav && <TopBar title={title || '바스락'} right={topRight} />
      )}
      <main className={`flex-1 flex flex-col ${fullWidth ? '' : 'px-5'} ${className}`}>
        {children}
        {showNav && !fullWidth && <div className="h-20 shrink-0" />}
      </main>
      {showNav && <BottomNav />}
    </div>
  )
}
