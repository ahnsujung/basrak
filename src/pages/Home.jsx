import PageLayout from '@/components/layout/PageLayout'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'

export default function Home() {
  return (
    <PageLayout>
      <TopBar title="바스락 🍂" />
      <main className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        지도 (Session 5에서 구현)
      </main>
      <BottomNav />
    </PageLayout>
  )
}
