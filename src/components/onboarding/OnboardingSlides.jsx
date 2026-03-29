import { useState } from 'react'

const SLIDES = [
  {
    emoji: '🍂',
    title: '주변 낙엽을 관찰해주세요',
    desc: '낙엽이 촉촉한지, 바스라지는지\n눈으로 확인하고 알려주세요',
  },
  {
    emoji: '🗺️',
    title: '산불 위험 지도가 만들어져요',
    desc: '시민 관측이 모여\n전국 산불 위험 지도가 완성됩니다',
  },
  {
    emoji: '🔥',
    title: '우리 산을 함께 지켜요',
    desc: '국립산림과학원과 함께하는\n시민과학 프로젝트입니다',
  },
]

const STORAGE_KEY = 'basrak_onboarding_done'

export function useOnboarding() {
  const isDev = import.meta.env.DEV
  const [show, setShow] = useState(() => isDev || !localStorage.getItem(STORAGE_KEY))

  const dismiss = () => {
    if (!isDev) localStorage.setItem(STORAGE_KEY, '1')
    setShow(false)
  }

  return { show, dismiss }
}

export default function OnboardingSlides({ onDone }) {
  const [page, setPage] = useState(0)
  const isLast = page === SLIDES.length - 1

  const handleNext = () => {
    if (isLast) {
      onDone()
    } else {
      setPage(page + 1)
    }
  }

  const slide = SLIDES[page]

  return (
    <div className="fixed inset-0 z-50 bg-brand flex flex-col items-center justify-center px-8">
      {/* 슬라이드 내용 */}
      <div className="flex flex-col items-center text-center">
        <span className="text-7xl mb-6">{slide.emoji}</span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-3">
          {slide.title}
        </h2>
        <p className="text-base text-white/70 whitespace-pre-line leading-relaxed">
          {slide.desc}
        </p>
      </div>

      {/* 하단 */}
      <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center gap-6 px-8">
        {/* 인디케이터 */}
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === page ? 'w-6 bg-white' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* 버튼 */}
        <button
          onClick={handleNext}
          className="w-full max-w-xs py-3.5 rounded-2xl bg-white text-brand font-bold text-base active:scale-[0.97] transition-transform"
        >
          {isLast ? '시작하기' : '다음'}
        </button>

        {/* 건너뛰기 */}
        {!isLast && (
          <button
            onClick={onDone}
            className="text-sm text-white/50"
          >
            건너뛰기
          </button>
        )}
      </div>
    </div>
  )
}
