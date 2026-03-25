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
  },
]

export default function DrynessSelector({ value, onChange }) {
  return (
    <section className="px-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        낙엽 건조도 (바스락 지수)
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {LEVELS.map(({ level, bg, border, text, label, desc, risk }) => {
          const selected = value === level
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={[
                'rounded-2xl p-3 text-left border-2 transition-all active:scale-[0.97]',
                selected
                  ? `${bg} ${border} shadow-sm`
                  : 'bg-white border-gray-100 hover:border-gray-300',
              ].join(' ')}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${selected ? text : 'text-gray-400'}`}>
                  단계 {level}
                </span>
                {selected && (
                  <span className={`text-xs font-medium ${text}`}>{risk}</span>
                )}
              </div>
              <p className={`text-sm font-semibold mb-0.5 ${selected ? 'text-gray-900' : 'text-gray-700'}`}>
                {label}
              </p>
              <p className="text-xs text-gray-500 leading-tight">{desc}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
