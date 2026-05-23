import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { TradingAccount } from '@/types/account'

export const ACTIVE_ACCOUNT_COOKIE = 'active_account_id'

/**
 * Resolve akun aktif untuk server components.
 * Urutan:
 *   1. Akun dengan id sesuai cookie (kalau masih valid).
 *   2. Akun pertama (urutan created_at ASC) sebagai fallback.
 *   3. null kalau user belum punya akun.
 */
export async function getActiveAccount(): Promise<{
  account: TradingAccount | null
  accounts: TradingAccount[]
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { account: null, accounts: [] }

  const { data } = await supabase
    .from('trading_accounts')
    .select('*')
    .eq('is_archived', false)
    .order('created_at', { ascending: true })

  const list = (data as TradingAccount[] | null) ?? []
  if (list.length === 0) return { account: null, accounts: [] }

  const cookieStore = await cookies()
  const cookieId = cookieStore.get(ACTIVE_ACCOUNT_COOKIE)?.value
  const fromCookie = cookieId ? list.find(a => a.id === cookieId) : undefined

  return { account: fromCookie ?? list[0], accounts: list }
}
