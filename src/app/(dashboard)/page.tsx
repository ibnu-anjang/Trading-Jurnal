import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getActiveAccount } from '@/lib/active-account'
import { BarChart3, TrendingUp, TrendingDown, Target, Activity, DollarSign, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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

  const startingCapital = account.initial_balance
  const currency = account.currency

  // Kalkulasi KPI
  const totalTrades = trades?.length ?? 0
  const wins = trades?.filter(t => t.win_loss === 'Win').length ?? 0
  const losses = trades?.filter(t => t.win_loss === 'Loss').length ?? 0
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0
  const totalNet = trades?.reduce((sum, t) => sum + (t.net ?? 0), 0) ?? 0
  const avgWin = wins > 0
    ? (trades?.filter(t => t.win_loss === 'Win').reduce((s, t) => s + t.net, 0) ?? 0) / wins
    : 0
  const avgLoss = losses > 0
    ? Math.abs((trades?.filter(t => t.win_loss === 'Loss').reduce((s, t) => s + t.net, 0) ?? 0) / losses)
    : 0
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0
  const roi = startingCapital > 0 ? (totalNet / startingCapital) * 100 : 0

  const kpiCards = [
    {
      title: 'Total Net P/L',
      value: `$${totalNet.toFixed(2)}`,
      sub: `ROI: ${roi.toFixed(2)}%`,
      icon: DollarSign,
      color: totalNet >= 0 ? 'text-emerald-400' : 'text-red-400',
      bg: totalNet >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20',
    },
    {
      title: 'Win Rate',
      value: `${winRate.toFixed(1)}%`,
      sub: `${wins}W / ${losses}L`,
      icon: Target,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Profit Factor',
      value: profitFactor.toFixed(2),
      sub: `Avg Win: $${avgWin.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20',
    },
    {
      title: 'Total Trades',
      value: totalTrades.toString(),
      sub: `Avg Loss: $${avgLoss.toFixed(2)}`,
      icon: Activity,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">{card.title}</CardTitle>
                <div className={`p-1.5 rounded-lg border ${card.bg}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                <p className="text-xs text-zinc-500 mt-1">{card.sub}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Equity Curve placeholder */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-400" />
            Equity Curve
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalTrades === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-zinc-600 gap-2">
              <TrendingDown className="h-8 w-8" />
              <p className="text-sm">Belum ada trade. Tambah trade pertamamu!</p>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-zinc-500 text-sm">
              Chart akan tampil setelah Fase 3
            </div>
          )}
        </CardContent>
      </Card>

      {/* Starting Capital info */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Starting Capital</span>
            <span className="text-zinc-200 font-medium">${startingCapital.toLocaleString()} {currency}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-zinc-500">Current Equity (estimasi)</span>
            <span className={`font-medium ${totalNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ${(startingCapital + totalNet).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
