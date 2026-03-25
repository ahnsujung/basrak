// risk_score = dryness_level + wind_level (범위: 2~10)

export const getRiskColor = (score) => {
  if (score <= 3) return '#4CAF50'
  if (score <= 5) return '#FFC107'
  if (score <= 7) return '#FF9800'
  return '#F44336'
}

export const getRiskLabel = (score) => {
  if (score <= 3) return '낮음'
  if (score <= 5) return '보통'
  if (score <= 7) return '높음'
  return '매우 높음'
}
