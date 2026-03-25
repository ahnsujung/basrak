import PageLayout from '@/components/layout/PageLayout'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'

export default function Profile() {
  return (
    <PageLayout>
      <TopBar title="내 기여" />
      <main className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        프로필 (Session 7에서 구현)
      </main>
      <BottomNav />
    </PageLayout>
  )
}
