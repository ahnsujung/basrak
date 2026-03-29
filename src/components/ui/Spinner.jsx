const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
}

export default function Spinner({ size = 'md', color = 'border-brand', className = '' }) {
  return (
    <span
      className={`inline-block rounded-full border-t-transparent animate-spin ${sizes[size]} ${color} ${className}`}
    />
  )
}
