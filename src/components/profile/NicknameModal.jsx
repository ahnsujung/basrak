import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

export default function NicknameModal({ open, onSave }) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    const trimmed = value.trim()
    if (!trimmed) { setError('닉네임을 입력해 주세요'); return }
    if (trimmed.length < 2) { setError('2자 이상 입력해 주세요'); return }
    if (trimmed.length > 12) { setError('12자 이하로 입력해 주세요'); return }
    setLoading(true)
    try {
      await onSave(trimmed)
    } catch {
      setError('저장에 실패했습니다. 다시 시도해 주세요')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open}>
      <div className="text-center mb-5">
        <span className="text-3xl">🌱</span>
        <h2 className="text-lg font-bold text-gray-900 mt-2">닉네임을 설정해 주세요</h2>
        <p className="text-sm text-gray-500 mt-1">활동 이력에 표시될 이름이에요</p>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => { setValue(e.target.value); setError('') }}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        placeholder="닉네임 입력 (2~12자)"
        maxLength={12}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2d6a4f] mb-1"
        autoFocus
      />
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      <Button fullWidth loading={loading} onClick={handleSave} className="mt-3">
        시작하기
      </Button>
    </Modal>
  )
}
