import { useState, useEffect, useCallback } from 'react'

export function useLocation() {
  const [status, setStatus] = useState(() =>
    navigator.geolocation ? 'acquiring' : 'error'
  )
  const [coords, setCoords] = useState(null)

  const handleSuccess = useCallback((pos) => {
    setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    setStatus('ready')
  }, [])

  const handleError = useCallback((err) => {
    setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error')
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    )
  }, [handleSuccess, handleError])

  return { status, coords }
}
