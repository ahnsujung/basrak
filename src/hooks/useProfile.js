import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

function toKSTDateStr(d) {
  return new Date(new Date(d).getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

async function backfillStreak(userId) {
  const today = toKSTDateStr(new Date())
  const yesterday = toKSTDateStr(new Date(Date.now() - 86400000))

  const { data: logs } = await supabase
    .from('point_logs')
    .select('created_at')
    .eq('user_id', userId)
    .eq('reason', 'observation')
    .order('created_at', { ascending: false })

  if (!logs?.length) return 0

  const dates = [...new Set(logs.map(l => toKSTDateStr(l.created_at)))]
  if (dates[0] !== today && dates[0] !== yesterday) return 0

  let streak = 0
  const cursor = new Date(dates[0] + 'T00:00:00+09:00')
  for (const date of dates) {
    if (date === toKSTDateStr(cursor)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  await supabase
    .from('profiles')
    .update({ streak_days: streak, last_observed_date: dates[0] })
    .eq('id', userId)

  return streak
}

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    supabase
      .from('profiles')
      .select('id, nickname, level, total_points, created_at, streak_days, last_observed_date, streak_shield')
      .eq('id', userId)
      .single()
      .then(async ({ data }) => {
        // last_observed_date가 없으면 point_logs로 백필
        if (data && !data.last_observed_date) {
          const streak = await backfillStreak(userId)
          setProfile({ ...data, streak_days: streak })
        } else {
          setProfile(data)
        }
        setLoading(false)
      })
  }, [userId])

  const updateNickname = async (nickname) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ nickname })
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    setProfile(data)
  }

  return { profile, loading, updateNickname }
}
