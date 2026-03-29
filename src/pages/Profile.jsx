import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '@/components/layout/PageLayout'
import LevelBadge from '@/components/profile/LevelBadge'
import PointHistory from '@/components/profile/PointHistory'
import MyObservations from '@/components/profile/MyObservations'
import NicknameModal from '@/components/profile/NicknameModal'
import Spinner from '@/components/ui/Spinner'
import { Flame, ChevronRight, Trophy, ClipboardList, LogOut, Shield, Plus, Minus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useAdmin } from '@/hooks/useAdmin'
import { getLevelInfo } from '@/components/profile/levelUtils'
import InstallCard from '@/components/pwa/InstallCard'

export default function Profile() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { profile, loading, updateNickname } = useProfile(user?.id)
  const { isAdmin } = useAdmin()
  const [activeSection, setActiveSection] = useState(null)
  const [editNickname, setEditNickname] = useState(false)

  const needNickname = !loading && profile && !profile.nickname
  const level = getLevelInfo(profile?.total_points ?? 0)

  const handleNicknameSave = async (nickname) => {
    await updateNickname(nickname)
  }

  if (loading) {
    return (
      <PageLayout title="마이페이지" sub className="items-center justify-center">
        <Spinner size="lg" />
      </PageLayout>
    )
  }

  return (
    <PageLayout title="마이페이지" sub className="gap-4 py-4">
      {/* 프로필 헤더 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl" style={{ backgroundColor: level.bg.replace('bg-', '') }}>
          <span className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${level.bg}`}>
            {level.icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <button
            onClick={() => setEditNickname(true)}
            className="text-lg font-extrabold text-gray-900 tracking-tight truncate flex items-center gap-1.5 hover:text-brand transition-colors"
          >
            {profile?.nickname ?? '이름 없음'}
            <span className="text-xs text-gray-300">✎</span>
          </button>
          <p className="typo-caption mt-0.5">{user?.email}</p>
          <p className={`text-xs font-semibold mt-1 ${level.color}`}>{level.label}</p>
        </div>
      </div>

      {/* 요약 카드 2열 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={16} className="text-orange-500" />
            <span className="typo-caption font-semibold text-gray-500">연속 관찰</span>
          </div>
          <p className="text-2xl font-black text-orange-500">{profile?.streak_days ?? 0}<span className="text-sm font-medium text-orange-400 ml-0.5">일</span></p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={16} className="text-brand" />
            <span className="typo-caption font-semibold text-gray-500">총 포인트</span>
          </div>
          <p className="text-2xl font-black text-brand">{(profile?.total_points ?? 0).toLocaleString()}<span className="text-sm font-medium text-brand-light ml-0.5">pt</span></p>
        </div>
      </div>

      {/* 등급 배지 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <LevelBadge points={profile?.total_points ?? 0} />
      </div>

      {/* 메뉴 리스트 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
        <button
          onClick={() => setActiveSection(activeSection === 'points' ? null : 'points')}
          className="w-full flex items-center justify-between px-4 py-3.5 active:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ClipboardList size={18} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-800">포인트 이력</span>
          </div>
          {activeSection === 'points' ? <Minus size={16} className="text-gray-400" /> : <Plus size={16} className="text-gray-400" />}
        </button>

        {activeSection === 'points' && (
          <div className="px-4 py-3">
            <PointHistory userId={user?.id} />
          </div>
        )}

        <button
          onClick={() => setActiveSection(activeSection === 'observations' ? null : 'observations')}
          className="w-full flex items-center justify-between px-4 py-3.5 active:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg leading-none">🍂</span>
            <span className="text-sm font-semibold text-gray-800">내 관찰</span>
          </div>
          {activeSection === 'observations' ? <Minus size={16} className="text-gray-400" /> : <Plus size={16} className="text-gray-400" />}
        </button>

        {activeSection === 'observations' && (
          <div className="px-4 py-3">
            <MyObservations userId={user?.id} />
          </div>
        )}
      </div>

      {/* 관리자 */}
      {isAdmin && (
        <button
          onClick={() => navigate('/admin_mobile')}
          className="bg-white rounded-2xl shadow-sm w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors"
        >
          <Shield size={18} className="text-brand" />
          <span className="text-sm font-semibold text-gray-800">관리자 대시보드</span>
          <ChevronRight size={18} className="text-gray-300 ml-auto" />
        </button>
      )}

      {/* 앱 설치 */}
      <InstallCard />

      {/* 로그아웃 */}
      <button
        onClick={signOut}
        className="bg-white rounded-2xl shadow-sm w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors"
      >
        <LogOut size={18} className="text-gray-400" />
        <span className="text-sm font-semibold text-gray-500">로그아웃</span>
      </button>

      <NicknameModal
        open={needNickname || editNickname}
        initialValue={editNickname ? (profile?.nickname ?? '') : ''}
        onSave={async (nickname) => {
          await handleNicknameSave(nickname)
          setEditNickname(false)
        }}
        onClose={() => setEditNickname(false)}
      />
    </PageLayout>
  )
}
