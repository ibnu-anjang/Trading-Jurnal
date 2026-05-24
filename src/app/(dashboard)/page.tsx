import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getActiveAccount } from '@/lib/active-account'
import { Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import DashboardContent from '@/components/dashboard/DashboardContent'
import type { Trade } from '@/types/trade'

export default async function DashboardPage() {
  const { account } = await getActiveAccount()

  if (!account) {
    return (
      <Card className="bg-zinc-900 border-zinc-800 max-w-md mx-auto mt-10">
        <CardContent className="p-6 space-y-3 text-center">
          <Wallet className="h-8 w-8 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-100">Belum ada akun trading</h3>
          <p className="text-xs text-zinc-500">Buat akun trading dulu untuk melihat dashboard.</p>
          <Link href="/accounts/new" className="inline-flex h-9 items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4">
            Buat Akun
          </Link>
        </CardContent>
      </Card>
    )
  }

  const supabase = await createClient()
  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('account_id', account.id)
    .order('trade_date', { ascending: false })

  return (
    <DashboardContent
      trades={(trades as Trade[] | null) ?? []}
      startingCapital={account.initial_balance}
      currency={account.currency}
    />
  )
}
