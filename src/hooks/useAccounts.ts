'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type {
  TradingAccount,
  TradingAccountInsert,
  TradingAccountUpdate,
} from '@/types/account'

// Module-level: client adalah singleton (lihat lib/supabase/client.ts)
const supabase = createClient()

async function queryAccounts(): Promise<TradingAccount[]> {
  const { data } = await supabase
    .from('trading_accounts')
    .select('*')
    .eq('is_archived', false)
    .order('created_at', { ascending: true })
  return (data as TradingAccount[] | null) ?? []
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<TradingAccount[]>([])
  const [loading, setLoading] = useState(true)

  // Empty deps → fetch hanya 1x on mount. Tidak ada useCallback yang bisa unstable.
  useEffect(() => {
    let alive = true
    queryAccounts().then(rows => {
      if (alive) {
        setAccounts(rows)
        setLoading(false)
      }
    })
    return () => { alive = false }
  }, [])

  async function refetch() {
    const rows = await queryAccounts()
    setAccounts(rows)
  }

  async function addAccount(payload: TradingAccountInsert) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Tidak terautentikasi', data: null }

    const { data, error } = await supabase
      .from('trading_accounts')
      .insert({ ...payload, user_id: user.id })
      .select()
      .single()

    if (error) return { error: error.message, data: null }
    await refetch()
    return { error: null, data: data as TradingAccount }
  }

  async function updateAccount(id: string, payload: TradingAccountUpdate) {
    const { error } = await supabase
      .from('trading_accounts')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return { error: error.message }
    await refetch()
    return { error: null }
  }

  async function archiveAccount(id: string) {
    return updateAccount(id, { is_archived: true })
  }

  async function deleteAccount(id: string) {
    const { error } = await supabase.from('trading_accounts').delete().eq('id', id)
    if (error) return { error: error.message }
    await refetch()
    return { error: null }
  }

  return { accounts, loading, addAccount, updateAccount, archiveAccount, deleteAccount, refetch }
}
