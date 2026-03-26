import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const POINTS_PER_OBSERVATION = 10
const MILESTONES = [100, 500, 1000, 5000, 10000]
const MILESTONE_BONUS = { 100: 50, 500: 100, 1000: 200 }

export function useObservation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const submit = async ({ dryness, wind, coords, photo, userId }) => {
    setLoading(true)
    setError(null)
    try {
      // 1. 사진 업로드 (첨부된 경우)
      let photoUrl = null
      if (photo) {
        const ext = photo.name.split('.').pop() || 'jpg'
        const path = `${userId}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('observation-photos')
          .upload(path, photo)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage
          .from('observation-photos')
          .getPublicUrl(path)
        photoUrl = urlData.publicUrl
      }

      // 2. 관측 데이터 저장
      const { error: obsError } = await supabase.from('observations').insert({
        user_id: userId,
        lat: coords.lat,
        lng: coords.lng,
        dryness_level: dryness,
        wind_level: wind,
        photo_url: photoUrl,
      })
      if (obsError) throw obsError

      // 3. 포인트 이력 저장
      const { error: logError } = await supabase.from('point_logs').insert({
        user_id: userId,
        points: POINTS_PER_OBSERVATION,
        reason: 'observation',
      })
      if (logError) throw logError

      // 4. 프로필 총 포인트 업데이트
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', userId)
        .single()
      if (fetchError) throw fetchError

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ total_points: (profile?.total_points ?? 0) + POINTS_PER_OBSERVATION })
        .eq('id', userId)
      if (updateError) throw updateError

      // 5. 마일스톤 체크
      const { data: totalCount } = await supabase.rpc('get_observation_count')
      const hitMilestone = MILESTONES.find((m) => totalCount === m)

      if (hitMilestone) {
        const shownKey = `milestone_${hitMilestone}_shown`
        if (!localStorage.getItem(shownKey)) {
          localStorage.setItem(shownKey, 'true')
          const bonus = MILESTONE_BONUS[hitMilestone] ?? 30
          await supabase.from('point_logs').insert({
            user_id: userId,
            points: bonus,
            reason: `milestone_${hitMilestone}`,
          })
          await supabase
            .from('profiles')
            .update({ total_points: (profile?.total_points ?? 0) + POINTS_PER_OBSERVATION + bonus })
            .eq('id', userId)
          setSuccess(true)
          return { success: true, milestone: hitMilestone }
        }
      }

      setSuccess(true)
      return { success: true, milestone: null }
    } catch (err) {
      setError(err.message || '관측 등록에 실패했습니다')
      return { success: false, milestone: null }
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setSuccess(false)
    setError(null)
  }

  return { submit, loading, error, success, reset }
}
