import { useState } from 'react'
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
import { useLocation } from '@/hooks/useLocation'
import { useMapObservations } from '@/hooks/useMapObservations'

export default function Home() {
  const [map, setMap] = useState(null)
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()
  const { status, coords } = useLocation()
  const { observations, totalCount, loading } = useMapObservations()

  const center = status === 'ready' ? coords : null

  return (
    <PageLayout>
      <TopBar title="바스락 🍂" />
      <main className="flex-1 relative overflow-hidden">
        <KakaoMap center={center} onMapReady={setMap} />
        <MapLegend count={loading ? null : observations.length} />

        {loading && (
          <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow z-10">
            <Spinner size="sm" />
          </div>
        )}

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
