import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '@/components/layout/PageLayout'
import { Pin, Plus, Minus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const SECTIONS = [
  {
    emoji: '🍂',
    title: '주변 낙엽을 관찰해주세요',
    desc: '낙엽이 촉촉한지, 바스라지는지 눈으로 확인하고 알려주세요.',
  },
  {
    emoji: '🗺️',
    title: '산불 위험 지도가 만들어져요',
    desc: '시민 관측이 모여 전국 산불 위험 지도가 완성됩니다.',
  },
  {
    emoji: '🔥',
    title: '우리 산을 함께 지켜요',
    desc: '국립산림과학원과 함께하는 시민과학 프로젝트입니다.',
  },
]

const STEPS = [
  { icon: '🍂', label: '건조도 선택', desc: '낙엽의 건조 상태를 4단계로 판단' },
  { icon: '💨', label: '풍속 선택', desc: '현재 바람의 세기를 6단계로 판단' },
  { icon: '📍', label: '등록 완료', desc: 'GPS 위치와 함께 자동 기록' },
]

export default function About() {
  const navigate = useNavigate()
  const [notices, setNotices] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    supabase
      .from('notices')
      .select('id, title, content, pinned, created_at')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => setNotices(data ?? []))
  }, [])

  return (
    <PageLayout className="gap-4 py-4 overflow-y-auto">
      {/* 공지사항 */}
      {notices.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-3.5 pb-2">
            <span className="text-sm font-bold text-gray-900">공지사항</span>
          </div>
          <div className="divide-y divide-gray-50">
            {(showAll ? notices : notices.slice(0, 3)).map((n) => (
              <div key={n.id}>
                <button
                  onClick={() => setExpandedId(expandedId === n.id ? null : n.id)}
                  className="w-full flex items-center gap-2.5 px-4 py-3 active:bg-gray-50 transition-colors text-left"
                >
                  {n.pinned && <Pin size={12} className="text-brand shrink-0" />}
                  <span className="text-sm text-gray-800 flex-1 truncate">{n.title}</span>
                  <span className="text-[10px] text-gray-300 shrink-0">
                    {new Date(n.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </span>
                  {expandedId === n.id ? <Minus size={14} className="text-gray-400" /> : <Plus size={14} className="text-gray-400" />}
                </button>
                {expandedId === n.id && (
                  <div className="px-4 pb-3">
                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{n.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {notices.length > 3 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-2.5 text-xs text-gray-400 hover:text-gray-600 transition-colors border-t border-gray-50"
            >
              더보기 ({notices.length - 3}건)
            </button>
          )}
        </div>
      )}

      {/* 프로젝트 소개 */}
      <div className="space-y-3">
        {SECTIONS.map(({ emoji, title, desc }) => (
          <div key={title} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 items-start">
            <span className="text-3xl shrink-0">{emoji}</span>
            <div>
              <p className="text-sm font-bold text-gray-900">{title}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 관측 방법 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-sm font-bold text-gray-900 mb-4">관측 방법</p>
        <div className="flex items-start justify-between gap-2">
          {STEPS.map(({ icon, label, desc }, i) => (
            <div key={label} className="flex-1 flex flex-col items-center text-center gap-1.5">
              <span className="text-2xl">{icon}</span>
              <p className="text-xs font-semibold text-gray-800">{label}</p>
              <p className="text-[10px] text-gray-400 leading-snug">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate('/observe')}
        className="w-full bg-brand text-white rounded-2xl py-3.5 font-bold text-sm active:scale-[0.97] transition-transform shadow-sm"
      >
        관측 시작하기
      </button>

      {/* 크레딧 */}
      <p className="text-center text-[10px] text-gray-300 pb-2">
        국립산림과학원 · 바스락 프로젝트
      </p>
    </PageLayout>
  )
}
