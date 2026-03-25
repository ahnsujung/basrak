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
      <div className="flex flex-col gap-2">
        {LEVELS.map(({ level, icon, label, desc }) => {
          const selected = value === level
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={[
                'flex items-center gap-3 rounded-2xl px-4 py-3 border-2 transition-all active:scale-[0.98]',
                selected
                  ? 'bg-blue-50 border-blue-400'
                  : 'bg-white border-gray-100 hover:border-gray-300',
              ].join(' ')}
            >
              <span className="text-2xl w-8 text-center">{icon}</span>
              <div className="flex-1 text-left">
                <p className={`text-sm font-semibold ${selected ? 'text-blue-800' : 'text-gray-800'}`}>
                  {label}
                </p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <span className={`text-xs font-bold w-6 text-center ${selected ? 'text-blue-600' : 'text-gray-300'}`}>
                {level}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
