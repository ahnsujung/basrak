import { useEffect } from 'react'
import confetti from 'canvas-confetti'

const MILESTONE_INFO = {
  100: {
    title: '🎉 전국 100번째 관측!',
    desc: '당신의 관측으로 바스락 지도가 처음으로 히트맵 모드로 전환됩니다.',
    bonus: 50,
    showModeSwitch: true,
  },
  500: {
    title: '🔥 전국 500번째 관측!',
    desc: '전국 산림의 절반 이상을 커버하기 시작했습니다.',
    bonus: 100,
    showModeSwitch: false,
  },
  1000: {
    title: '🌲 전국 1000번째 관측!',
    desc: '마을 단위 위험 감지가 시작됩니다.',
    bonus: 200,
    showModeSwitch: false,
  },
}

export default function MilestoneModal({ count, onClose }) {
  useEffect(() => {
    const duration = 3000
    const end = Date.now() + duration
    const colors = ['#2d6a4f', '#52b788', '#f4a261']

    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors })
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [])

  const info = MILESTONE_INFO[count] ?? {
    title: `🌟 ${count}번째 관측!`,
    desc: '대단한 기여입니다!',
    bonus: 30,
    showModeSwitch: false,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl mx-6 p-6 text-center shadow-2xl">
        <p className="text-3xl font-bold mb-2">{info.title}</p>
        <p className="text-gray-600 text-sm mb-4">{info.desc}</p>

        {info.showModeSwitch && (
          <div className="flex items-center justify-center gap-3 my-4">
            <div className="text-xs text-center">
              <div className="w-16 h-16 rounded-full bg-orange-200 flex items-center justify-center mb-1">
                <span className="text-2xl">●</span>
              </div>
              <span className="text-gray-500">영향권 원</span>
            </div>
            <span className="text-gray-400 text-xl">→</span>
            <div className="text-xs text-center">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-200 via-yellow-200 to-red-300 flex items-center justify-center mb-1">
                <span className="text-lg">🔥</span>
              </div>
              <span className="text-gray-500">히트맵</span>
            </div>
          </div>
        )}

        <div className="bg-green-50 rounded-xl p-3 mb-4">
          <p className="text-green-700 font-bold text-lg">+{info.bonus} 포인트 지급!</p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-green-700 text-white rounded-xl py-3 font-bold"
        >
          지도 확인하기
        </button>
      </div>
    </div>
  )
}
