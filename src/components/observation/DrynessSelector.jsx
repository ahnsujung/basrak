import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const LEVELS = [
  {
    level: 1,
    bg: 'bg-green-50',
    border: 'border-green-400',
    label: '촉촉함',
    desc: '뭉쳤을 때 물기가 묻어남',
    risk: '낮음',
  },
  {
    level: 2,
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    label: '구겨짐',
    desc: '물기 없음 + 낙엽이 구겨짐',
    risk: '다소 높음',
  },
  {
    level: 3,
    bg: 'bg-orange-50',
    border: 'border-orange-400',
    label: '쪼개짐',
    desc: '물기 없음 + 낙엽이 쪼개짐',
    risk: '높음',
  },
  {
    level: 4,
    bg: 'bg-red-50',
    border: 'border-red-400',
    label: '바스라짐',
    desc: '물기 없음 + 잘게 바스라짐',
    risk: '매우 높음',
  },
]

export default function DrynessSelector({ value, onChange }) {
  const [photos, setPhotos] = useState([null, null, null, null])

  useEffect(() => {
    supabase
      .from('app_config')
      .select('value')
      .eq('key', 'dryness_photos')
      .single()
      .then(({ data }) => {
        if (data?.value) {
          try {
            const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value
            if (Array.isArray(parsed)) setPhotos(parsed)
          } catch {}
        }
      })
  }, [])

  return (
    <section>
      <h2 className="typo-section-label mb-3">
        낙엽 건조도 (바스락 지수)
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {LEVELS.map(({ level, bg, border, label, desc, risk }, idx) => {
          const photo = photos[idx] || null
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
              <div className="relative w-full aspect-square bg-gray-200">
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
    </section>
  )
}
