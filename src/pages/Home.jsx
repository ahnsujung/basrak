import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboardingSlides, { useOnboarding } from '@/components/onboarding/OnboardingSlides'
import PageLayout from '@/components/layout/PageLayout'
import LeafletMap from '@/components/map/LeafletMap'
import ObservationLayer from '@/components/map/ObservationLayer'
import MapLegend from '@/components/map/MapLegend'
import ObservationSheet from '@/components/map/ObservationSheet'
import Spinner from '@/components/ui/Spinner'
import StreakBanner from '@/components/home/StreakBanner'
import LocalContributionCard from '@/components/home/LocalContributionCard'
import { useLocation } from '@/hooks/useLocation'
import { useMapObservations } from '@/hooks/useMapObservations'
import { useLocalContribution } from '@/hooks/useLocalContribution'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'

export default function Home() {
  const [map, setMap] = useState(null)
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()
  const { show: showOnboarding, dismiss: dismissOnboarding } = useOnboarding()
  const { coords } = useLocation()
  const { observations, totalCount, loading, error: mapError } = useMapObservations()
  const { user } = useAuth()
  const { profile } = useProfile(user?.id)
  const { data: contribution } = useLocalContribution(coords?.lat, coords?.lng, user?.id)

  if (showOnboarding) return <OnboardingSlides onDone={dismissOnboarding} />

  return (
    <PageLayout
      fullWidth
      className="relative overflow-hidden"
    >
      <StreakBanner
        streakDays={profile?.streak_days}
        hasShield={profile?.streak_shield > 0}
      />
      <div className="flex-1 relative overflow-hidden">
        <LeafletMap onMapReady={setMap} coords={coords} />
        <MapLegend count={loading ? null : observations.length} />

        {loading && (
          <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow z-10">
            <Spinner size="sm" />
          </div>
        )}

        {mapError && (
          <div className="absolute top-3 left-3 right-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 z-10">
            <p className="text-xs text-red-600">지도 데이터 오류: {mapError}</p>
          </div>
        )}

<LocalContributionCard data={contribution} />

        <ObservationLayer
          map={map}
          observations={observations}
          totalCount={totalCount}
          onSelect={setSelected}
        />

      </div>

      <ObservationSheet observation={selected} onClose={() => setSelected(null)} />
    </PageLayout>
  )
}
