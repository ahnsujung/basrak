export default function EmptyMapOverlay({ onObserve }) {
  return (
    <div className="absolute inset-0 z-10 flex items-end justify-center pb-24 pointer-events-none">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-5 mx-6 text-center border border-gray-100 pointer-events-auto max-w-sm">
        <p className="text-3xl mb-2">🍂</p>
        <p className="typo-section-title mb-1">시민이 만드는 산불 위험 지도</p>
        <p className="typo-sub leading-relaxed mb-4">
          주변 낙엽의 건조 상태와 바람을 관찰하면<br />
          이 지도에 위험도가 표시됩니다
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mb-4">
          <span>🍂 건조도 선택</span>
          <span>→</span>
          <span>💨 풍속 선택</span>
          <span>→</span>
          <span>📍 등록 완료</span>
        </div>
        <button
          onClick={onObserve}
          className="w-full bg-brand-light text-white rounded-2xl shadow-md py-3 font-bold text-sm active:scale-[0.97] transition-transform"
        >
          첫 관측 시작하기
        </button>
      </div>
    </div>
  )
}
