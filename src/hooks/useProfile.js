import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

function localDateStr(d) {
  const date = new Date(d)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function calcStreak(dates) {
  if (!dates.length) return 0
  const todayStr = localDateStr(new Date())
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = localDateStr(yesterday)
  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) return 0
  let count = 0
  const cursor = new Date(dates[0] + 'T00:00:00')
  for (const date of dates) {
    if (date === localDateStr(cursor)) {
      count++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return count
}

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    Promise.all([
      supabase
        .from('profiles')
        .select('id, nickname, level, total_points, created_at')
        .eq('id', userId)
        .single(),
      supabase
        .from('point_logs')
        .select('created_at')
        .eq('user_id', userId)
        .eq('reason', 'observation')
        .order('created_at', { ascending: false }),
    ]).then(([{ data: profileData }, { data: logData }]) => {
      setProfile(profileData)
      if (logData) {
        const dates = [...new Set(logData.map(d => localDateStr(d.created_at)))]
        setStreak(calcStreak(dates))
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

  return { profile, streak, loading, updateNickname }
}
