import { useState, useEffect } from 'react'

export function useLocation() {
  const [status, setStatus] = useState('acquiring') // 'acquiring' | 'ready' | 'denied' | 'error'
  const [coords, setCoords] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('error')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus('ready')
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error')
      },
      { timeout: 5000, maximumAge: 30000 }
    )
  }, [])

  return { status, coords }
}
