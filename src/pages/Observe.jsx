import { useState, useEffect } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import DrynessSelector from '@/components/observation/DrynessSelector'
import WindSelector from '@/components/observation/WindSelector'
import LocationStatus from '@/components/observation/LocationStatus'
import PhotoAttach from '@/components/observation/PhotoAttach'
import SubmitButton from '@/components/observation/SubmitButton'

export default function Observe() {
  const [dryness, setDryness] = useState(null)
  const [wind, setWind] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [locationStatus, setLocationStatus] = useState('acquiring')
  const [coords, setCoords] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('error')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationStatus('ready')
      },
      () => setLocationStatus('denied'),
      { timeout: 10000 }
    )
  }, [])

  const handleSubmit = () => {
    // Session 4에서 실제 저장 로직 연결
    console.log({ dryness, wind, coords, photo })
  }

  return (
    <PageLayout>
      <TopBar title="관측 입력" />
      <main className="flex-1 flex flex-col gap-5 py-4 pb-6 overflow-y-auto">
        <LocationStatus status={locationStatus} coords={coords} />
        <DrynessSelector value={dryness} onChange={setDryness} />
        <WindSelector value={wind} onChange={setWind} />
        <PhotoAttach photo={photo} onChange={setPhoto} />
        <SubmitButton
          dryness={dryness}
          wind={wind}
          location={locationStatus}
          loading={false}
          onSubmit={handleSubmit}
        />
      </main>
      <BottomNav />
    </PageLayout>
  )
}
