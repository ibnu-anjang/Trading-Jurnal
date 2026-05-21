'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trade, TradeInsert } from '@/types/trade'

export function useTrades() {
  const supabase = createClient()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrades = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('trade_date', { ascending: false })

    if (error) setError(error.message)
    else setTrades(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchTrades() }, [fetchTrades])

  async function addTrade(payload: TradeInsert) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Tidak terautentikasi' }

    const { error } = await supabase.from('trades').insert({
      ...payload,
      user_id: user.id,
    })

    if (error) return { error: error.message }
    await fetchTrades()
    return { error: null }
  }

  async function deleteTrade(id: string) {
    const { error } = await supabase.from('trades').delete().eq('id', id)
    if (error) return { error: error.message }
    await fetchTrades()
    return { error: null }
  }

  return { trades, loading, error, addTrade, deleteTrade, refetch: fetchTrades }
}
