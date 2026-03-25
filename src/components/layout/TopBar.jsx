export default function TopBar({ title, right }) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
      <span className="text-lg font-semibold text-gray-900">{title}</span>
      {right && <div>{right}</div>}
    </header>
  )
}
