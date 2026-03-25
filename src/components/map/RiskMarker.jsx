import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { getRiskColor, getRiskLabel } from '@/utils/riskCalculator'

export default function RiskMarker({ map, observation, onClick }) {
  const markerRef = useRef(null)

  useEffect(() => {
    if (!map || !observation) return

    const { lat, lng, risk_score } = observation
    const color = getRiskColor(risk_score)
    const label = getRiskLabel(risk_score)

    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:14px;height:14px;
        background:${color};
        border:2px solid white;
        border-radius:50%;
        box-shadow:0 1px 4px rgba(0,0,0,0.35);
        cursor:pointer;
        transition:transform 0.1s;
      " title="위험도: ${label} (${risk_score}점)"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    })

    markerRef.current = L.marker([lat, lng], { icon })
      .addTo(map)
      .on('click', () => onClick?.(observation))

    return () => {
      markerRef.current?.remove()
      markerRef.current = null
    }
  }, [map, observation]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
