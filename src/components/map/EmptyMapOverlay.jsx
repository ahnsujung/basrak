export default function EmptyMapOverlay({ onObserve }) {
  return (
    <div className="absolute inset-0 z-10 flex items-end justify-center pb-24 pointer-events-none">
      <div className="bg-white/90 rounded-2xl px-5 py-4 mx-6 text-center shadow-lg pointer-events-auto">
        <p className="text-2xl mb-1">🍂</p>
        <p className="font-bold text-gray-800 mb-1">아직 관측이 없어요</p>
        <p className="text-sm text-gray-500 mb-3">첫 번째 관측을 남겨보세요</p>
        <button
          onClick={onObserve}
          className="bg-green-700 text-white text-sm rounded-xl px-5 py-2 font-bold"
        >
          지금 관측하기
        </button>
      </div>
    </div>
  )
}
