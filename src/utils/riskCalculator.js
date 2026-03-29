// risk_score = dryness_level + wind_level (범위: 2~10)

import { risk } from '@/constants/theme'

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
