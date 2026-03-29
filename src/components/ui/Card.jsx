export default function Card({ children, className = '', onClick }) {
  const base = 'rounded-2xl bg-white border border-gray-100'
  const interactive = onClick
    ? 'cursor-pointer hover:border-brand transition-colors active:scale-[0.98]'
    : ''
  return (
    <div className={`${base} ${interactive} ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}
