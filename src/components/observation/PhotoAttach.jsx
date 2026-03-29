import { useRef } from 'react'
import { Camera } from 'lucide-react'

function compressImage(file, maxWidth = 1280, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const ratio = Math.min(1, maxWidth / Math.max(img.width, img.height))
      const w = Math.round(img.width * ratio)
      const h = Math.round(img.height * ratio)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }))
      }, 'image/jpeg', quality)
    }
    img.src = URL.createObjectURL(file)
  })
}

export default function PhotoAttach({ photo, onChange }) {
  const inputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) onChange(await compressImage(file))
  }

  const handleRemove = () => {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <section>
      <h2 className="typo-section-label mb-3">
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
          className="w-full h-24 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-brand-light hover:text-brand-light transition-colors active:scale-[0.98]"
        >
          <Camera size={24} className="text-gray-400" />
          <span className="text-sm">사진 추가</span>
        </button>
      )}
    </section>
  )
}
