import { useState, useEffect, useCallback } from 'react'
import { Download } from 'lucide-react'

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || navigator.standalone === true
}

export default function InstallCard() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installed, setInstalled] = useState(isStandalone)

  useEffect(() => {
    if (installed) return
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [installed])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setDeferredPrompt(null)
  }, [deferredPrompt])

  if (installed) return null

  const ios = isIOS()

  return (
    <button
      onClick={ios ? undefined : handleInstall}
      className="bg-brand/5 rounded-2xl p-4 shadow-sm w-full flex items-center gap-3 text-left active:bg-brand/10 transition-colors"
    >
      <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shrink-0">
        <Download size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800">바스락 앱 설치</p>
        {ios ? (
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Safari{' '}
            <svg className="inline w-3.5 h-3.5 text-blue-500 align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v12m0-12l-3 3m3-3l3 3" />
            </svg>{' '}
            → 홈 화면에 추가
          </p>
        ) : (
          <p className="text-xs text-gray-500 mt-0.5">탭하여 홈 화면에 추가</p>
        )}
      </div>
    </button>
  )
}
