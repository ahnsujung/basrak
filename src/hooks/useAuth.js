import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(undefined) // undefined = 로딩 중, null = 비로그인

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    }).catch(() => {
      setUser(null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, nickname) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    // 트리거가 profiles 행을 생성한 뒤 닉네임 저장
    if (data.user && nickname) {
      await supabase.from('profiles').update({ nickname }).eq('id', data.user.id)
    }
  }

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signInWithKakao = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: window.location.origin,
        scopes: 'profile_nickname profile_image',
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return { user, signUp, signIn, signInWithKakao, signOut }
}
