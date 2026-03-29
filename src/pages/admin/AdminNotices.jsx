import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import Spinner from '@/components/ui/Spinner'
import { Pin, Trash2, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminNotices() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [pinned, setPinned] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchNotices = async () => {
    const { data } = await supabase
      .from('notices')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
    setNotices(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchNotices() }, [])

  const resetForm = () => {
    setEditId(null)
    setTitle('')
    setContent('')
    setPinned(false)
  }

  const startEdit = (n) => {
    setEditId(n.id)
    setTitle(n.title)
    setContent(n.content)
    setPinned(n.pinned)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)

    if (editId) {
      await supabase.from('notices')
        .update({ title: title.trim(), content: content.trim(), pinned, updated_at: new Date().toISOString() })
        .eq('id', editId)
    } else {
      await supabase.from('notices')
        .insert({ title: title.trim(), content: content.trim(), pinned })
    }

    resetForm()
    await fetchNotices()
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    await supabase.from('notices').delete().eq('id', id)
    if (editId === id) resetForm()
    setNotices(prev => prev.filter(n => n.id !== id))
  }

  if (loading) {
    return (
      <PageLayout title="공지 관리" sub className="items-center justify-center">
        <Spinner size="lg" />
      </PageLayout>
    )
  }

  return (
    <PageLayout title="공지 관리" sub className="gap-4 py-4 overflow-y-auto">
      {/* 작성/수정 폼 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        {editId && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand">수정 중</span>
            <button type="button" onClick={resetForm} className="text-xs text-gray-400 underline">취소</button>
          </div>
        )}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-light focus:bg-white transition-colors"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용"
          rows={4}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-light focus:bg-white transition-colors resize-none"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="accent-brand"
            />
            상단 고정
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="bg-brand-light text-white rounded-2xl shadow-md px-5 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {submitting ? (editId ? '수정 중...' : '등록 중...') : (editId ? '수정' : '등록')}
          </button>
        </div>
      </form>

      {/* 목록 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
        {notices.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">공지사항이 없습니다</p>
        )}
        {notices.map((n) => (
          <div key={n.id} className={`flex items-start gap-3 px-4 py-3 ${editId === n.id ? 'bg-brand/5' : ''}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {n.pinned && <Pin size={12} className="text-brand shrink-0" />}
                <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.content}</p>
              <p className="text-[10px] text-gray-300 mt-1">
                {new Date(n.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => startEdit(n)}
                className="p-1.5 text-gray-300 hover:text-brand transition-colors"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleDelete(n.id)}
                className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
