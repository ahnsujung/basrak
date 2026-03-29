import { useState, useEffect, useCallback } from 'react'
import { ChevronUp } from 'lucide-react'

function getScroll() {
  return document.getElementById('app-scroll')
}

export default function ScrollToTop({ hasNav = true }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = getScroll()
    if (!el) return
    const handler = () => setVisible(el.scrollTop > 100)
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [])

  const handleClick = useCallback(() => {
    getScroll()?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={handleClick}
      className={`fixed right-4 z-30 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-500 active:scale-90 transition-transform ${
        hasNav ? 'bottom-20' : 'bottom-6'
      }`}
    >
      <ChevronUp size={20} strokeWidth={2} />
    </button>
  )
}
