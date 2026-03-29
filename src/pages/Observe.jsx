import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '@/components/layout/PageLayout'
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
import { supabase } from '@/lib/supabase'

export default function Observe() {
  const [dryness, setDryness] = useState(null)
  const [wind, setWind] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [milestoneCount, setMilestoneCount] = useState(null)
  const [nearbyObs, setNearbyObs] = useState(null)

  const navigate = useNavigate()
  const { status: locationStatus, coords } = useLocation()
  const { user } = useAuth()
  const { submit, loading, error, success, reset } = useObservation()

  const handleSubmit = async () => {
    if (!user) {
      navigate('/auth', { state: { from: '/observe' } })
      return
    }
    const result = await submit({ dryness, wind, coords, photo, userId: user.id })

    // 근처 24시간 관측 조회 (중간값 표시용)
    if (result?.success && coords) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const threshold = 0.06 // ~6km
      const { data } = await supabase
        .from('observations')
        .select('dryness_level, wind_level')
        .gte('observed_at', since)
        .gte('lat', coords.lat - threshold)
        .lte('lat', coords.lat + threshold)
        .gte('lng', coords.lng - threshold)
        .lte('lng', coords.lng + threshold)
      setNearbyObs(data ?? [])
    }

    if (result?.milestone) {
      setMilestoneCount(result.milestone)
    }
  }

  const handleSuccessClose = () => {
    reset()
    setDryness(null)
    setWind(null)
    setPhoto(null)
    setNearbyObs(null)
  }

  return (
    <PageLayout className="gap-4 py-4 pb-6">
      <LocationStatus status={locationStatus} coords={coords} />
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <DrynessSelector value={dryness} onChange={setDryness} />
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <WindSelector value={wind} onChange={setWind} />
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <PhotoAttach photo={photo} onChange={setPhoto} />
      </div>

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      <SubmitButton
        dryness={dryness}
        wind={wind}
        location={locationStatus}
        loading={loading}
        onSubmit={handleSubmit}
      />

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
