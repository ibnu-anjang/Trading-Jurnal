'use client'

import { useMemo } from 'react'
import type { Trade } from '@/types/trade'

interface Props {
  trades: Trade[]
  currency: string
}

interface HourStat {
  hour: number
  count: number
  net: number
  wins: number
  losses: number
}

export default function HourlyHeatmap({ trades, currency }: Props) {
  const stats = useMemo<HourStat[]>(() => {
    const buckets: HourStat[] = Array.from({ length: 24 }, (_, i) => ({
      hour: i, count: 0, net: 0, wins: 0, losses: 0,
    }))
    trades.forEach(t => {
      const h = new Date(t.trade_date).getHours()
      const b = buckets[h]
      b.count += 1
      b.net += t.net ?? 0
      if (t.win_loss === 'Win') b.wins += 1
      else if (t.win_loss === 'Loss') b.losses += 1
    })
    return buckets
  }, [trades])

  if (trades.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-zinc-600 text-sm">
        Belum ada trade.
      </div>
    )
  }

  const maxAbs = Math.max(...stats.map(s => Math.abs(s.net)), 1)

  function cellColor(net: number, count: number) {
    if (count === 0) return 'bg-zinc-800/40 border-zinc-700/40'
    const intensity = Math.abs(net) / maxAbs // 0..1
    if (net > 0) {
      if (intensity > 0.66) return 'bg-emerald-500/50 border-emerald-500/60'
      if (intensity > 0.33) return 'bg-emerald-500/30 border-emerald-500/40'
      return 'bg-emerald-500/15 border-emerald-500/25'
    }
    if (net < 0) {
      if (intensity > 0.66) return 'bg-red-500/50 border-red-500/60'
      if (intensity > 0.33) return 'bg-red-500/30 border-red-500/40'
      return 'bg-red-500/15 border-red-500/25'
    }
    return 'bg-zinc-800/60 border-zinc-700/60'
  }

  return (
    <div className="space-y-3">
      {/* 24-cell grid, 6 col mobile / 12 col sm / 24 col xl */}
      <div className="grid grid-cols-6 sm:grid-cols-12 xl:grid-cols-[repeat(24,minmax(0,1fr))] gap-1">
        {stats.map(s => (
          <div
            key={s.hour}
            className={`group relative aspect-square rounded-md border flex flex-col items-center justify-center text-center transition-colors ${cellColor(s.net, s.count)}`}
            title={s.count > 0
              ? `${String(s.hour).padStart(2, '0')}:00 · ${s.count} trade · ${currency} ${s.net.toFixed(2)} · ${s.wins}W/${s.losses}L`
              : `${String(s.hour).padStart(2, '0')}:00 · no trades`}
          >
            <span className="text-[9px] text-zinc-500 leading-none">
              {String(s.hour).padStart(2, '0')}
            </span>
            {s.count > 0 && (
              <span className={`text-[10px] font-semibold leading-tight mt-0.5 ${
                s.net > 0 ? 'text-emerald-300' : s.net < 0 ? 'text-red-300' : 'text-zinc-400'
              }`}>
                {s.net >= 0 ? '+' : ''}{Math.round(s.net)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[10px] text-zinc-500">
        <span>00:00 → 23:00 (waktu lokal)</span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-red-500/50 border border-red-500/60" /> Loss
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-zinc-800/40 border border-zinc-700/40" /> No
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/50 border border-emerald-500/60" /> Profit
          </span>
        </div>
      </div>
    </div>
  )
}
