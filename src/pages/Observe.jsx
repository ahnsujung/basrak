import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '@/components/layout/PageLayout'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import DrynessSelector from '@/components/observation/DrynessSelector'
import WindSelector from '@/components/observation/WindSelector'
import LocationStatus from '@/components/observation/LocationStatus'
import PhotoAttach from '@/components/observation/PhotoAttach'
import SubmitButton from '@/components/observation/SubmitButton'
import SuccessSheet from '@/components/observation/SuccessSheet'
import MilestoneModal from '@/components/map/MilestoneModal'
import { useLocation } from '@/hooks/useLocation'
import { useObservation } from '@/hooks/useObservation'
import { useAuth } from '@/hooks/useAuth'

export default function Observe() {
  const [dryness, setDryness] = useState(null)
  const [wind, setWind] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [milestoneCount, setMilestoneCount] = useState(null)

  const navigate = useNavigate()
  const { status: locationStatus, coords } = useLocation()
  const { user } = useAuth()
  const { submit, loading, error, success, reset } = useObservation()

  const handleSubmit = async () => {
    const result = await submit({ dryness, wind, coords, photo, userId: user.id })
    if (result?.milestone) {
      setMilestoneCount(result.milestone)
    }
  }

  const handleSuccessClose = () => {
    reset()
    setDryness(null)
    setWind(null)
    setPhoto(null)
  }

  return (
    <PageLayout>
      <TopBar title="관찰 입력" />
      <main className="flex-1 flex flex-col gap-5 py-4 pb-6 overflow-y-auto">
        <LocationStatus status={locationStatus} coords={coords} />
        <DrynessSelector value={dryness} onChange={setDryness} />
        <WindSelector value={wind} onChange={setWind} />
        <PhotoAttach photo={photo} onChange={setPhoto} />

        {error && (
          <p className="mx-4 text-sm text-red-500 text-center">{error}</p>
        )}

        <SubmitButton
          dryness={dryness}
          wind={wind}
          location={locationStatus}
          loading={loading}
          onSubmit={handleSubmit}
        />
      </main>
      <BottomNav />

      <SuccessSheet
        open={success}
        dryness={dryness}
        wind={wind}
        onClose={handleSuccessClose}
      />

      {milestoneCount && (
        <MilestoneModal
          count={milestoneCount}
          onClose={() => {
            setMilestoneCount(null)
            navigate('/')
          }}
        />
      )}
    </PageLayout>
  )
}
