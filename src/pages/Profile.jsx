import { useState } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import LevelBadge from '@/components/profile/LevelBadge'
import PointHistory from '@/components/profile/PointHistory'
import MyObservations from '@/components/profile/MyObservations'
import NicknameModal from '@/components/profile/NicknameModal'
import Spinner from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'

export default function Profile() {
  const { user, signOut } = useAuth()
  const { profile, streak, loading, updateNickname } = useProfile(user?.id)
  const [tab, setTab] = useState('points') // 'points' | 'observations'

  const needNickname = !loading && profile && !profile.nickname

  const handleNicknameSave = async (nickname) => {
    await updateNickname(nickname)
  }

  if (loading) {
    return (
      <PageLayout>
        <TopBar title="나의 기여도" />
        <main className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </main>
        <BottomNav />
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <TopBar
        title="내 기여"
        right={
          <button onClick={signOut} className="text-sm text-gray-400 hover:text-gray-600">
            로그아웃
          </button>
        }
      />

      <main className="flex-1 flex flex-col gap-5 py-4 overflow-y-auto">
        {/* 닉네임 + 이메일 */}
        <section className="px-4">
          <p className="text-xl font-bold text-gray-900">
            {profile?.nickname ?? '이름 없음'}
          </p>
          <p className="text-sm text-gray-400">{user?.email}</p>
        </section>

        {/* 연속 관찰 스트릭 */}
        <section className="px-4">
          <div className="bg-orange-50 rounded-2xl px-4 py-3 flex items-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-black text-orange-500 leading-none">{streak}</p>
              <p className="text-xs text-orange-400 font-medium mt-0.5">일째</p>
            </div>
            <div>
              <p className="text-sm font-bold text-orange-700">🔥 연속 관찰 중!</p>
              <p className="text-xs text-orange-400">매일 관찰하면 스트릭이 쌓여요</p>
            </div>
          </div>
        </section>

        {/* 등급 배지 */}
        <section className="px-4">
          <LevelBadge points={profile?.total_points ?? 0} />
        </section>

        {/* 탭 */}
        <section className="px-4">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {[
              { key: 'points', label: '포인트 이력' },
              { key: 'observations', label: '내 관찰' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={[
                  'flex-1 py-2 text-sm font-medium rounded-lg transition-colors',
                  tab === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="px-4 pb-4">
          {tab === 'points' ? (
            <PointHistory userId={user?.id} />
          ) : (
            <MyObservations userId={user?.id} />
          )}
        </section>
      </main>

      <BottomNav />

      <NicknameModal
        open={needNickname}
        onSave={handleNicknameSave}
      />
    </PageLayout>
  )
}
