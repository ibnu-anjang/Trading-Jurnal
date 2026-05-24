'use client'

import { useMemo, useState } from 'react'
import { BarChart3, TrendingUp, Target, Activity, DollarSign, CalendarDays, Layers, ArrowLeftRight, Flame, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import EquityCurve from '@/components/dashboard/EquityCurve'
import { DayOfWeekChart, SymbolChart, LongShortStat } from '@/components/dashboard/BreakdownCharts'
import DateRangeFilter, { computeRange, type DateRange } from '@/components/dashboard/DateRangeFilter'
import type { Trade } from '@/types/trade'

interface Props {
  trades: Trade[]
  startingCapital: number
  currency: string
}

function filterByRange(trades: Trade[], range: DateRange): Trade[] {
  if (!range.from && !range.to) return trades
  return trades.filter(t => {
    const d = t.trade_date.slice(0, 10)
    if (range.from && d < range.from) return false
    if (range.to && d > range.to) return false
    return true
  })
}

export default function DashboardContent({ trades, startingCapital, currency }: Props) {
  const [range, setRange] = useState<DateRange>(() => computeRange('all'))

  const filtered = useMemo(() => filterByRange(trades, range), [trades, range])

  const kpis = useMemo(() => {
    const totalTrades = filtered.length
    const wins = filtered.filter(t => t.win_loss === 'Win').length
    const losses = filtered.filter(t => t.win_loss === 'Loss').length
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0
    const totalNet = filtered.reduce((sum, t) => sum + (t.net ?? 0), 0)
    const avgWin = wins > 0
      ? filtered.filter(t => t.win_loss === 'Win').reduce((s, t) => s + t.net, 0) / wins
      : 0
    const avgLoss = losses > 0
      ? Math.abs(filtered.filter(t => t.win_loss === 'Loss').reduce((s, t) => s + t.net, 0) / losses)
      : 0
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0
    const roi = startingCapital > 0 ? (totalNet / startingCapital) * 100 : 0

    // Current streak: hari berturut-turut dengan sign net P/L sama, dihitung mundur dari hari terakhir
    const dailyMap: Record<string, number> = {}
    filtered.forEach(t => {
      const day = t.trade_date.slice(0, 10)
      dailyMap[day] = (dailyMap[day] ?? 0) + (t.net ?? 0)
    })
    const sortedDays = Object.keys(dailyMap).sort() // ascending
    let currentStreakCount = 0
    let currentStreakType: 'W' | 'L' | null = null
    for (let i = sortedDays.length - 1; i >= 0; i--) {
      const net = dailyMap[sortedDays[i]]
      const type = net > 0 ? 'W' : net < 0 ? 'L' : null
      if (type === null) break
      if (currentStreakType === null) { currentStreakType = type; currentStreakCount = 1 }
      else if (type === currentStreakType) currentStreakCount += 1
      else break
    }

    // Max drawdown: walk chronologically through trades, track equity peak, max gap
    const chronological = [...filtered].sort((a, b) => a.trade_date.localeCompare(b.trade_date))
    let equity = startingCapital
    let peak = startingCapital
    let maxDrawdown = 0
    let maxDrawdownPct = 0
    chronological.forEach(t => {
      equity += t.net ?? 0
      if (equity > peak) peak = equity
      const dd = peak - equity
      if (dd > maxDrawdown) {
        maxDrawdown = dd
        maxDrawdownPct = peak > 0 ? (dd / peak) * 100 : 0
      }
    })

    return {
      totalTrades, wins, losses, winRate, totalNet, avgWin, avgLoss, profitFactor, roi,
      currentStreakCount, currentStreakType,
      maxDrawdown, maxDrawdownPct,
      tradingDays: sortedDays.length,
    }
  }, [filtered, startingCapital])

  const kpiCards = [
    {
      title: 'Total Net P/L',
      value: `$${kpis.totalNet.toFixed(2)}`,
      sub: `ROI: ${kpis.roi.toFixed(2)}%`,
      icon: DollarSign,
      color: kpis.totalNet >= 0 ? 'text-emerald-400' : 'text-red-400',
      bg: kpis.totalNet >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20',
    },
    {
      title: 'Win Rate',
      value: `${kpis.winRate.toFixed(1)}%`,
      sub: `${kpis.wins}W / ${kpis.losses}L`,
      icon: Target,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Profit Factor',
      value: kpis.profitFactor.toFixed(2),
      sub: `Avg Win: $${kpis.avgWin.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20',
    },
    {
      title: 'Total Trades',
      value: kpis.totalTrades.toString(),
      sub: `Avg Loss: $${kpis.avgLoss.toFixed(2)}`,
      icon: Activity,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Current Streak',
      value: kpis.currentStreakType
        ? `${kpis.currentStreakCount}${kpis.currentStreakType}`
        : '—',
      sub: kpis.currentStreakType === 'W'
        ? `${kpis.currentStreakCount} hari profit`
        : kpis.currentStreakType === 'L'
          ? `${kpis.currentStreakCount} hari loss`
          : `${kpis.tradingDays} trading days`,
      icon: Flame,
      color: kpis.currentStreakType === 'W' ? 'text-emerald-400' : kpis.currentStreakType === 'L' ? 'text-red-400' : 'text-zinc-400',
      bg: kpis.currentStreakType === 'W'
        ? 'bg-emerald-500/10 border-emerald-500/20'
        : kpis.currentStreakType === 'L'
          ? 'bg-red-500/10 border-red-500/20'
          : 'bg-zinc-800 border-zinc-700',
    },
    {
      title: 'Max Drawdown',
      value: kpis.maxDrawdown > 0 ? `-$${kpis.maxDrawdown.toFixed(2)}` : '—',
      sub: kpis.maxDrawdown > 0 ? `${kpis.maxDrawdownPct.toFixed(2)}% dari peak` : 'belum ada DD',
      icon: TrendingDown,
      color: kpis.maxDrawdown > 0 ? 'text-orange-400' : 'text-zinc-400',
      bg: kpis.maxDrawdown > 0 ? 'bg-orange-500/10 border-orange-500/20' : 'bg-zinc-800 border-zinc-700',
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Date range filter */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <DateRangeFilter value={range} onChange={setRange} />
        <span className="text-[11px] text-zinc-500 tabular-nums">
          {filtered.length} dari {trades.length} trade
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-zinc-400 truncate">{card.title}</CardTitle>
                <div className={`p-1.5 rounded-lg border shrink-0 ${card.bg}`}>
                  <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <p className={`text-lg sm:text-2xl font-bold tabular-nums ${card.color}`}>{card.value}</p>
                <p className="text-[10px] sm:text-xs text-zinc-500 mt-1 truncate">{card.sub}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Equity Curve */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-zinc-100 text-sm sm:text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-400" />
            Equity Curve
          </CardTitle>
          <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
            <span className="text-zinc-500">Start: <span className="text-zinc-300 tabular-nums">{currency} {startingCapital.toLocaleString('id-ID')}</span></span>
            <span className="text-zinc-500">Now: <span className={`font-semibold tabular-nums ${kpis.totalNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{currency} {(startingCapital + kpis.totalNet).toLocaleString('id-ID')}</span></span>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-4">
          <EquityCurve trades={filtered} startingCapital={startingCapital} currency={currency} />
        </CardContent>
      </Card>

      {/* Breakdown grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-100 text-sm sm:text-base flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-violet-400" />
              Long vs Short
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LongShortStat trades={filtered} currency={currency} />
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-100 text-sm sm:text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-400" />
              Performa per Hari
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-4">
            <DayOfWeekChart trades={filtered} currency={currency} />
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-100 text-sm sm:text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-400" />
              Top Symbols
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-4">
            <SymbolChart trades={filtered} currency={currency} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
