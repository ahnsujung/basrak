import PageLayout from '@/components/layout/PageLayout'
import TopBar from '@/components/layout/TopBar'

export default function Auth() {
  return (
    <PageLayout>
      <TopBar title="로그인" />
      <main className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        로그인/회원가입 (Session 2에서 구현)
      </main>
    </PageLayout>
  )
}
