import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '@/components/layout/PageLayout'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import KakaoMap from '@/components/map/KakaoMap'
import ObservationLayer from '@/components/map/ObservationLayer'
import MapLegend from '@/components/map/MapLegend'
import ObservationSheet from '@/components/map/ObservationSheet'
import EmptyMapOverlay from '@/components/map/EmptyMapOverlay'
import Spinner from '@/components/ui/Spinner'
import StreakBanner from '@/components/home/StreakBanner'
import LocalContributionCard from '@/components/home/LocalContributionCard'
import LevelBadge from '@/components/profile/LevelBadge'
import { useLocation } from '@/hooks/useLocation'
import { useMapObservations } from '@/hooks/useMapObservations'
import { useLocalContribution } from '@/hooks/useLocalContribution'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'

export default function Home() {
  const [map, setMap] = useState(null)
  const [selected, setSelected] = useState(null)
  const flyToRef = useRef(null)
  const navigate = useNavigate()
  const { status, coords } = useLocation()
  const { observations, totalCount, loading } = useMapObservations()
  const { user } = useAuth()
  const { profile } = useProfile(user?.id)
  const contribution = useLocalContribution(coords?.lat, coords?.lng, user?.id)

  const handleMyLocation = () => {
    if (coords) flyToRef.current?.(coords)
  }

  return (
    <PageLayout>
      <TopBar
        title="바스락 🍂"
        right={profile && <LevelBadge points={profile.total_points ?? 0} size="sm" />}
      />
      <StreakBanner
        streakDays={profile?.streak_days}
        hasShield={profile?.streak_shield > 0}
      />
      <main className="flex-1 relative overflow-hidden">
        <KakaoMap onMapReady={setMap} flyToRef={flyToRef} />
        <MapLegend count={loading ? null : observations.length} />

        {loading && (
          <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow z-10">
            <Spinner size="sm" />
          </div>
        )}

        {/* 내 위치 FAB */}
        <button
          onClick={handleMyLocation}
          disabled={status !== 'ready'}
          className="absolute bottom-6 right-4 z-10 w-11 h-11 rounded-full bg-white shadow-lg flex items-center justify-center disabled:opacity-40"
          title="내 위치로"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-700" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </button>

        <LocalContributionCard data={contribution} />

        <ObservationLayer
          map={map}
          observations={observations}
          totalCount={totalCount}
          onSelect={setSelected}
        />


        {!loading && observations.length === 0 && (
          <EmptyMapOverlay onObserve={() => navigate('/observe')} />
        )}
      </main>
      <BottomNav />

      <ObservationSheet observation={selected} onClose={() => setSelected(null)} />
    </PageLayout>
  )
}
