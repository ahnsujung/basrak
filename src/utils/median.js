/**
 * 숫자 배열의 보간 중간값 반환
 * 항상 두 중심값의 평균을 사용하여 소수점 표현
 */
export function median(arr) {
  if (!arr.length) return 0
  if (arr.length === 1) return arr[0]
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return (sorted[mid - 1] + sorted[mid]) / 2
}
