'use client'

import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from 'recharts'
import type { Trade } from '@/types/trade'

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

interface Props {
  trades: Trade[]
  currency: string
}

function tooltipStyle() {
  return {
    contentStyle: {
      backgroundColor: '#18181b',
      border: '1px solid #27272a',
      borderRadius: 8,
      fontSize: 12,
    },
    labelStyle: { color: '#a1a1aa' },
  }
}

function fmtMoney(v: number, currency: string) {
  return `${currency} ${v.toLocaleString('id-ID', { maximumFractionDigits: 2 })}`
}

/* ---------------------- Day of Week ---------------------- */

function DayOfWeekChart({ trades, currency }: Props) {
  const data = useMemo(() => {
    const buckets = DAY_NAMES.map((day, idx) => ({
      day,
      idx,
      net: 0,
      count: 0,
    }))
    trades.forEach(t => {
      const dow = new Date(t.trade_date).getDay()
      buckets[dow].net += t.net ?? 0
      buckets[dow].count += 1
    })
    return buckets
  }, [trades])

  const hasData = data.some(d => d.count > 0)
  if (!hasData) {
    return <p className="text-xs text-zinc-600 text-center py-12">Belum ada trade.</p>
  }

  const t = tooltipStyle()
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 8, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#71717a' }} stroke="#3f3f46" tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#71717a' }} stroke="#3f3f46" tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} width={48} />
          <Tooltip
            {...t}
            formatter={(v) => [fmtMoney(Number(v) || 0, currency), 'Net P/L']}
            labelFormatter={(label, payload) => {
              const p = payload?.[0]?.payload
              return p ? `${label} (${p.count} trade${p.count > 1 ? 's' : ''})` : label
            }}
          />
          <Bar dataKey="net" radius={[4, 4, 0, 0]}>
            {data.map(d => (
              <Cell key={d.idx} fill={d.net >= 0 ? '#34d399' : '#f87171'} fillOpacity={d.count === 0 ? 0.2 : 0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ---------------------- Symbol ---------------------- */

function SymbolChart({ trades, currency }: Props) {
  const data = useMemo(() => {
    const map = new Map<string, { net: number; count: number }>()
    trades.forEach(t => {
      const prev = map.get(t.symbol) ?? { net: 0, count: 0 }
      prev.net += t.net ?? 0
      prev.count += 1
      map.set(t.symbol, prev)
    })
    return Array.from(map.entries())
      .map(([symbol, v]) => ({ symbol, ...v }))
      .sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
      .slice(0, 8) // top 8 by absolute net
  }, [trades])

  if (data.length === 0) {
    return <p className="text-xs text-zinc-600 text-center py-12">Belum ada trade.</p>
  }

  const t = tooltipStyle()
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: '#71717a' }} stroke="#3f3f46" tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
          <YAxis type="category" dataKey="symbol" tick={{ fontSize: 10, fill: '#a1a1aa' }} stroke="#3f3f46" tickLine={false} width={64} />
          <Tooltip
            {...t}
            formatter={(v) => [fmtMoney(Number(v) || 0, currency), 'Net P/L']}
            labelFormatter={(label, payload) => {
              const p = payload?.[0]?.payload
              return p ? `${label} (${p.count} trade${p.count > 1 ? 's' : ''})` : label
            }}
          />
          <Bar dataKey="net" radius={[0, 4, 4, 0]}>
            {data.map(d => (
              <Cell key={d.symbol} fill={d.net >= 0 ? '#34d399' : '#f87171'} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ---------------------- Long vs Short ---------------------- */

function LongShortStat({ trades, currency }: Props) {
  const stats = useMemo(() => {
    const sides = ['Long', 'Short'] as const
    return sides.map(side => {
      const filtered = trades.filter(t => t.direction === side)
      const wins = filtered.filter(t => t.win_loss === 'Win').length
      const losses = filtered.filter(t => t.win_loss === 'Loss').length
      const total = filtered.length
      const net = filtered.reduce((s, t) => s + (t.net ?? 0), 0)
      const winRate = total > 0 ? (wins / total) * 100 : 0
      return { side, total, wins, losses, net, winRate }
    })
  }, [trades])

  if (trades.length === 0) {
    return <p className="text-xs text-zinc-600 text-center py-12">Belum ada trade.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 py-2">
      {stats.map(s => {
        const isLong = s.side === 'Long'
        const accent = isLong ? 'text-emerald-400' : 'text-red-400'
        const bg = isLong ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
        return (
          <div key={s.side} className={`rounded-lg border p-3 sm:p-4 ${bg}`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-xs sm:text-sm font-semibold ${accent}`}>{s.side}</p>
              <p className="text-[10px] sm:text-xs text-zinc-500">{s.total} trade{s.total !== 1 ? 's' : ''}</p>
            </div>
            <p className={`text-lg sm:text-2xl font-bold tabular-nums ${s.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {s.net >= 0 ? '+' : ''}{fmtMoney(s.net, currency)}
            </p>
            <div className="flex items-center gap-3 mt-2 text-[10px] sm:text-xs">
              <span className="text-emerald-400">{s.wins}W</span>
              <span className="text-red-400">{s.losses}L</span>
              <span className="text-zinc-500">{s.winRate.toFixed(0)}% WR</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { DayOfWeekChart, SymbolChart, LongShortStat }
