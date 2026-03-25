import { useRef } from 'react'

export default function PhotoAttach({ photo, onChange }) {
  const inputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onChange(file)
  }

  const handleRemove = () => {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <section className="px-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        사진 첨부 <span className="text-gray-400 font-normal normal-case">(선택)</span>
      </h2>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {photo ? (
        <div className="relative rounded-2xl overflow-hidden bg-gray-100">
          <img
            src={URL.createObjectURL(photo)}
            alt="첨부 사진"
            className="w-full h-48 object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white text-sm hover:bg-black/70"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-24 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[#2d6a4f] hover:text-[#2d6a4f] transition-colors active:scale-[0.98]"
        >
          <span className="text-2xl">📷</span>
          <span className="text-sm">사진 추가</span>
        </button>
      )}
    </section>
  )
}
