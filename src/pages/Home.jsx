import { useState } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import KakaoMap from '@/components/map/KakaoMap'
import RiskMarker from '@/components/map/RiskMarker'
import MapLegend from '@/components/map/MapLegend'
import ObservationSheet from '@/components/map/ObservationSheet'
import Spinner from '@/components/ui/Spinner'
import { useLocation } from '@/hooks/useLocation'
import { useMapObservations } from '@/hooks/useMapObservations'

export default function Home() {
  const [map, setMap] = useState(null)
  const [selected, setSelected] = useState(null)
  const { status, coords } = useLocation()
  const { observations, loading } = useMapObservations()

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

        {map && observations.map((obs) => (
          <RiskMarker key={obs.id} map={map} observation={obs} onClick={setSelected} />
        ))}
      </main>
      <BottomNav />

      <ObservationSheet observation={selected} onClose={() => setSelected(null)} />
    </PageLayout>
  )
}
