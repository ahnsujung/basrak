import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

function calcStreak(dates) {
  if (!dates.length) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().slice(0, 10)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)
  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) return 0
  let count = 0
  const cursor = new Date(dates[0])
  for (const date of dates) {
    if (date === cursor.toISOString().slice(0, 10)) {
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
        .from('observations')
        .select('observed_at')
        .eq('user_id', userId)
        .order('observed_at', { ascending: false }),
    ]).then(([{ data: profileData }, { data: obsData }]) => {
      setProfile(profileData)
      if (obsData) {
        const dates = [...new Set(obsData.map(d => d.observed_at.slice(0, 10)))]
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
