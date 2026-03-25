export default function PageLayout({ children, className = '' }) {
  return (
    <div className={`w-full max-w-[430px] min-h-dvh mx-auto relative overflow-x-hidden bg-white flex flex-col ${className}`}>
      {children}
    </div>
  )
}
