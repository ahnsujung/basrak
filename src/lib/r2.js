// R2 스토리지 설정 — 단일 소스
export const R2_WORKER_URL = import.meta.env.VITE_R2_WORKER_URL || 'https://basrak-upload.ahnsujung.workers.dev'
export const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || 'https://pub-08a381c0b76a4644a805f200110cbc90.r2.dev'

export async function uploadToR2(key, file) {
  const res = await fetch(`${R2_WORKER_URL}/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'image/jpeg' },
    body: file,
  })
  if (!res.ok) throw new Error('사진 업로드에 실패했습니다')
  return `${R2_PUBLIC_URL}/${key}`
}

export async function deleteFromR2(publicUrl) {
  if (!publicUrl.startsWith(R2_PUBLIC_URL)) return
  const key = publicUrl.replace(R2_PUBLIC_URL + '/', '')
  await fetch(`${R2_WORKER_URL}/${key}`, { method: 'DELETE' }).catch(() => {})
}
