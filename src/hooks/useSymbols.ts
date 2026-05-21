'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Symbol {
  id: string
  name: string
  description: string | null
  created_at: string
}

export function useSymbols() {
  const supabase = createClient()
  const [symbols, setSymbols] = useState<Symbol[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('symbols')
      .select('*')
      .order('name', { ascending: true })
    setSymbols(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetch() }, [fetch])

  async function addSymbol(name: string, description?: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Tidak terautentikasi' }

    const { error } = await supabase.from('symbols').insert({
      user_id: user.id,
      name: name.toUpperCase().trim(),
      description: description?.trim() || null,
    })
    if (error) return { error: error.message }
    await fetch()
    return { error: null }
  }

  async function deleteSymbol(id: string) {
    const { error } = await supabase.from('symbols').delete().eq('id', id)
    if (error) return { error: error.message }
    await fetch()
    return { error: null }
  }

  async function updateSymbol(id: string, name: string, description?: string) {
    const { error } = await supabase.from('symbols').update({
      name: name.toUpperCase().trim(),
      description: description?.trim() || null,
    }).eq('id', id)
    if (error) return { error: error.message }
    await fetch()
    return { error: null }
  }

  return { symbols, loading, addSymbol, deleteSymbol, updateSymbol, refetch: fetch }
}
