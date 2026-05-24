'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trade, TradeInsert } from '@/types/trade'

const supabase = createClient()

async function queryTrades(accountId: string): Promise<Trade[]> {
  const { data } = await supabase
    .from('trades')
    .select('*')
    .eq('account_id', accountId)
    .order('trade_date', { ascending: false })
  return (data as Trade[] | null) ?? []
}

/**
 * Fetch & CRUD trades terbatas pada accountId.
 * Kalau accountId null/undefined, hook idle (tidak fetch).
 */
export function useTrades(accountId: string | null) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState<boolean>(!!accountId)
  const [error, setError] = useState<string | null>(null)

  // Ref agar mutation functions selalu pakai accountId terbaru tanpa harus re-create.
  const accountIdRef = useRef(accountId)
  accountIdRef.current = accountId

  useEffect(() => {
    if (!accountId) {
      setTrades([])
      setLoading(false)
      return
    }
    let alive = true
    setLoading(true)
    queryTrades(accountId).then(rows => {
      if (alive) {
        setTrades(rows)
        setLoading(false)
      }
    })
    return () => { alive = false }
  }, [accountId])

  async function refetch() {
    const id = accountIdRef.current
    if (!id) return
    const rows = await queryTrades(id)
    setTrades(rows)
  }

  async function addTrade(payload: TradeInsert) {
    const id = accountIdRef.current
    if (!id) return { error: 'Pilih akun trading terlebih dahulu' }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Tidak terautentikasi' }

    const { error: err } = await supabase.from('trades').insert({
      ...payload,
      user_id: user.id,
      account_id: id,
    })
    if (err) { setError(err.message); return { error: err.message } }
    await refetch()
    return { error: null }
  }

  async function deleteTrade(id: string) {
    const { error: err } = await supabase.from('trades').delete().eq('id', id)
    if (err) return { error: err.message }
    await refetch()
    return { error: null }
  }

  async function updateTrade(id: string, payload: TradeInsert) {
    const { error: err } = await supabase.from('trades').update(payload).eq('id', id)
    if (err) { setError(err.message); return { error: err.message } }
    await refetch()
    return { error: null }
  }

  return { trades, loading, error, addTrade, updateTrade, deleteTrade, refetch }
}
