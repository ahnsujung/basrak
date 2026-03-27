import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    supabase
      .from('profiles')
      .select('id, nickname, level, total_points, created_at, streak_days, streak_shield')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        setProfile(data)
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
