import { useEffect } from 'react'

export default function Modal({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="relative z-50 w-full max-w-[380px] bg-white rounded-2xl px-5 pb-6 pt-5 shadow-xl animate-slide-up max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
