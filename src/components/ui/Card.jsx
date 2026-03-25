export default function Card({ children, className = '', onClick }) {
  const base = 'rounded-2xl bg-white border border-gray-100 shadow-sm'
  const interactive = onClick
    ? 'cursor-pointer hover:border-[#2d6a4f] hover:shadow-md transition-all active:scale-[0.98]'
    : ''
  return (
    <div className={`${base} ${interactive} ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}
