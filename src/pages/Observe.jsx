import PageLayout from '@/components/layout/PageLayout'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'

export default function Observe() {
  return (
    <PageLayout>
      <TopBar title="관측 입력" />
      <main className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        관측 입력 (Session 3에서 구현)
      </main>
      <BottomNav />
    </PageLayout>
  )
}
