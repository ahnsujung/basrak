// 건조도(1-4) × 풍속(1-6) 매트릭스 기반 위험도 (범위: 1~10)

import { risk } from '@/constants/theme'

// RISK_MATRIX[dryness_level][wind_level] — DB generated column과 동기화
const RISK_MATRIX = [
  [],                       // 0: unused
  [0, 1, 1, 2, 2, 3, 3],   // 건조도1 (촉촉)
  [0, 3, 3, 4, 5, 5, 6],   // 건조도2 (구겨짐)
  [0, 5, 5, 6, 7, 7, 8],   // 건조도3 (쪼개짐)
  [0, 7, 7, 8, 9, 9, 10],  // 건조도4 (바스라짐)
]

export const calcRiskScore = (dryness, wind) => RISK_MATRIX[dryness]?.[wind] ?? 0

export const getRiskColor = (score) => {
  if (score <= 3) return risk.low
  if (score <= 5) return risk.moderate
  if (score <= 7) return risk.high
  return risk.critical
}

export const getRiskLabel = (score) => {
  if (score <= 3) return '낮음'
  if (score <= 5) return '보통'
  if (score <= 7) return '높음'
  return '매우 높음'
}
