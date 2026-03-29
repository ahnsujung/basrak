import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'pwa_install_dismissed'
const DISMISS_DAYS = 7

function isDismissed() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return false
  const dismissed = Number(raw)
  return Date.now() - dismissed < DISMISS_DAYS * 24 * 60 * 60 * 1000
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || navigator.standalone === true
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showIOS, setShowIOS] = useState(false)
  const [visible, setVisible] = useState(false)

  // Android: beforeinstallprompt
  useEffect(() => {
    if (isStandalone() || isDismissed()) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // iOS: Safari 감지
  useEffect(() => {
    if (isStandalone() || isDismissed()) return
    if (isIOS() && !deferredPrompt) {
      setShowIOS(true)
      setVisible(true)
    }
  }, [deferredPrompt])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
    }
    setDeferredPrompt(null)
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
    setVisible(false)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-[398px] animate-slide-up">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3.5">
        {showIOS ? (
          <>
            <p className="text-sm font-semibold text-gray-800 mb-1">
              바스락을 홈 화면에 추가하세요
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Safari 하단의{' '}
              <span className="inline-block align-middle">
                <svg className="inline w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v12m0-12l-3 3m3-3l3 3" />
                </svg>
              </span>{' '}
              공유 버튼 → <strong>홈 화면에 추가</strong>를 눌러주세요
            </p>
            <button
              onClick={handleDismiss}
              className="mt-2.5 w-full text-center text-xs text-gray-400 py-1"
            >
              닫기
            </button>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-gray-800">
              바스락 앱 설치
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              홈 화면에서 바로 실행할 수 있어요
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleDismiss}
                className="flex-1 text-sm font-semibold text-gray-400 bg-gray-100 rounded-xl py-2.5"
              >
                닫기
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 text-sm font-semibold text-white bg-brand-light rounded-2xl shadow-md py-2.5"
              >
                설치하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
