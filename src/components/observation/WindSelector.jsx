const LEVELS = [
  { level: 1, icon: '🌿', label: '바람 없음', desc: '나뭇가지 정지' },
  { level: 2, icon: '🍃', label: '산들바람', desc: '나뭇잎 흔들림' },
  { level: 3, icon: '🌬️', label: '약한 바람', desc: '작은 가지 흔들림' },
  { level: 4, icon: '💨', label: '보통 바람', desc: '큰 가지 흔들림' },
  { level: 5, icon: '🌀', label: '강한 바람', desc: '나무 전체 흔들림' },
  { level: 6, icon: '⛈️', label: '매우 강한 바람', desc: '걷기 어려움' },
]

export default function WindSelector({ value, onChange }) {
  return (
    <section className="px-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        체감 풍속
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {LEVELS.map(({ level, icon, label, desc }) => {
          const selected = value === level
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={[
                'rounded-xl px-3 py-2 text-left border-2 transition-all active:scale-[0.97] flex items-center gap-2',
                selected
                  ? 'bg-blue-50 border-blue-400 shadow-sm'
                  : 'bg-white border-gray-100 hover:border-gray-300',
              ].join(' ')}
            >
              <span className="text-lg shrink-0">{icon}</span>
              <div className="min-w-0">
                <p className={`text-xs font-semibold leading-tight ${selected ? 'text-blue-800' : 'text-gray-700'}`}>
                  {label}
                </p>
                <p className="text-[10px] text-gray-400 leading-tight truncate">{desc}</p>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
