import { useState } from 'react'

const LEVELS = [
  {
    level: 1,
    color: '#4CAF50',
    bg: 'bg-green-50',
    border: 'border-green-400',
    text: 'text-green-700',
    label: '촉촉함',
    desc: '뭉쳤을 때 물기가 묻어남',
    risk: '낮음',
    photo: null, // TODO: 실제 사진으로 교체
  },
  {
    level: 2,
    color: '#FFC107',
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-700',
    label: '구겨짐',
    desc: '물기 없음 + 낙엽이 구겨짐',
    risk: '다소 높음',
    photo: null,
  },
  {
    level: 3,
    color: '#FF9800',
    bg: 'bg-orange-50',
    border: 'border-orange-400',
    text: 'text-orange-700',
    label: '쪼개짐',
    desc: '물기 없음 + 낙엽이 쪼개짐',
    risk: '높음',
    photo: null,
  },
  {
    level: 4,
    color: '#F44336',
    bg: 'bg-red-50',
    border: 'border-red-400',
    text: 'text-red-700',
    label: '바스라짐',
    desc: '물기 없음 + 잘게 바스라짐',
    risk: '매우 높음',
    photo: null,
  },
]

export default function DrynessSelector({ value, onChange }) {
  const [viewPhoto, setViewPhoto] = useState(null)

  return (
    <section>
      <h2 className="typo-section-label mb-3">
        낙엽 건조도 (바스락 지수)
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {LEVELS.map(({ level, bg, border, text, label, desc, risk, photo }) => {
          const selected = value === level
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={[
                'rounded-2xl overflow-hidden text-left border-2 transition-all active:scale-[0.97]',
                selected
                  ? `${bg} ${border} shadow-sm`
                  : 'bg-white border-gray-100 hover:border-gray-300',
              ].join(' ')}
            >
              <div
                className="relative w-full aspect-square bg-gray-200"
                onClick={(e) => {
                  if (photo) {
                    e.stopPropagation()
                    setViewPhoto(photo)
                  }
                }}
              >
                {photo && (
                  <img src={photo} alt={label} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent pt-8 pb-2 px-2.5 flex flex-col justify-end">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-bold">{label}</p>
                    <span className="text-white/70 text-[10px]">단계 {level}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-white/70 text-[10px] leading-tight">{desc}</p>
                    {selected && <span className="text-white/90 text-[10px] font-medium">{risk}</span>}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* 이미지 뷰어 */}
      {viewPhoto && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90" onClick={() => setViewPhoto(null)}>
          <button className="absolute top-[env(safe-area-inset-top,12px)] right-4 mt-3 w-9 h-9 bg-white/15 rounded-full flex items-center justify-center text-white text-base" onClick={() => setViewPhoto(null)}>
            ✕
          </button>
          <img src={viewPhoto} alt="건조도 참고 사진" className="max-w-full max-h-full object-contain px-5" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  )
}
