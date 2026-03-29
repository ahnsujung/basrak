import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import Spinner from '@/components/ui/Spinner'
import { supabase } from '@/lib/supabase'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, nickname, total_points, streak_days, role, created_at')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setUsers(data ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <PageLayout title="사용자 관리" sub className="items-center justify-center">
        <Spinner size="lg" />
      </PageLayout>
    )
  }

  return (
    <PageLayout title="사용자 관리" sub className="gap-4 py-4">
      <div className="flex items-center justify-end">
        <span className="text-sm text-gray-500">{users.length}명</span>
      </div>

      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {u.nickname ?? '이름 없음'}
                {u.role === 'admin' && (
                  <span className="ml-1.5 text-[10px] font-bold text-white bg-brand rounded px-1 py-0.5">관리자</span>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(u.created_at).toLocaleDateString('ko-KR')} 가입
              </p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="text-sm font-bold text-brand">{(u.total_points ?? 0).toLocaleString()}pt</p>
              <p className="text-xs text-gray-400">{u.streak_days ?? 0}일 연속</p>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
