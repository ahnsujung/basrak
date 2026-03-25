import { useEffect } from 'react'
import { getRiskColor, getRiskLabel } from '@/utils/riskCalculator'

export default function RiskMarker({ map, observation }) {
  useEffect(() => {
    if (!map || !observation) return

    const { lat, lng, risk_score } = observation
    const color = getRiskColor(risk_score)
    const label = getRiskLabel(risk_score)

    const el = document.createElement('div')
    el.title = `위험도: ${label} (${risk_score}점)`
    el.style.cssText = [
      `width: 14px`,
      `height: 14px`,
      `background: ${color}`,
      `border: 2px solid white`,
      `border-radius: 50%`,
      `box-shadow: 0 1px 4px rgba(0,0,0,0.35)`,
      `cursor: pointer`,
      `transition: transform 0.1s`,
    ].join(';')
    el.onmouseenter = () => { el.style.transform = 'scale(1.4)' }
    el.onmouseleave = () => { el.style.transform = 'scale(1)' }

    const overlay = new window.kakao.maps.CustomOverlay({
      position: new window.kakao.maps.LatLng(lat, lng),
      content: el,
      yAnchor: 0.5,
    })
    overlay.setMap(map)

    return () => overlay.setMap(null)
  }, [map, observation])

  return null
}
