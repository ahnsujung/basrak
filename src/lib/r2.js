// R2 스토리지 설정 — 단일 소스
const R2_WORKER_URL = import.meta.env.VITE_R2_WORKER_URL
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL

export async function uploadToR2(key, file) {
  if (!R2_WORKER_URL || !R2_PUBLIC_URL) {
    throw new Error('R2 환경변수 누락: VITE_R2_WORKER_URL=' + R2_WORKER_URL + ', VITE_R2_PUBLIC_URL=' + R2_PUBLIC_URL)
  }
  const res = await fetch(`${R2_WORKER_URL}/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'image/jpeg' },
    body: file,
  })
  if (!res.ok) throw new Error('사진 업로드에 실패했습니다')
  return `${R2_PUBLIC_URL}/${key}`
}

export async function deleteFromR2(publicUrl) {
  if (!R2_WORKER_URL || !R2_PUBLIC_URL) return
  if (!publicUrl.startsWith(R2_PUBLIC_URL)) return
  const key = publicUrl.replace(R2_PUBLIC_URL + '/', '')
  await fetch(`${R2_WORKER_URL}/${key}`, { method: 'DELETE' }).catch(() => {})
}
