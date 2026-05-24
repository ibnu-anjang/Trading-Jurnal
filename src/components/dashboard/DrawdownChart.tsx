'use client'

import { useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'
import type { Trade } from '@/types/trade'

interface Props {
  trades: Trade[]
  startingCapital: number
}

interface Point {
  ts: number
  drawdownPct: number  // negatif atau 0
  drawdown: number     // dolar
  equity: number
  peak: number
}

function formatShortDate(d: Date) {
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}

export default function DrawdownChart({ trades, startingCapital }: Props) {
  const data = useMemo<Point[]>(() => {
    if (trades.length === 0) return []
    const sorted = [...trades].sort(
      (a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
    )
    const firstTs = new Date(sorted[0].trade_date).getTime()
    let equity = startingCapital
    let peak = startingCapital
    const points: Point[] = [
      { ts: firstTs - 1, drawdownPct: 0, drawdown: 0, equity: startingCapital, peak: startingCapital },
    ]
    sorted.forEach(t => {
      equity += t.net ?? 0
      if (equity > peak) peak = equity
      const dd = equity - peak // ≤ 0
      const ddPct = peak > 0 ? (dd / peak) * 100 : 0
      points.push({
        ts: new Date(t.trade_date).getTime(),
        drawdown: dd,
        drawdownPct: ddPct,
        equity,
        peak,
      })
    })
    return points
  }, [trades, startingCapital])

  if (data.length === 0) {
    return (
      <div className="h-48 sm:h-56 flex flex-col items-center justify-center text-zinc-600 gap-2 text-sm">
        Belum ada trade.
      </div>
    )
  }

  const minDD = Math.min(...data.map(p => p.drawdownPct))
  const yDomain: [number, number] = [Math.floor(minDD * 1.1), 0]

  return (
    <div className="h-48 sm:h-56 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fb923c" stopOpacity={0} />
              <stop offset="95%" stopColor="#fb923c" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="ts"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(v) => formatShortDate(new Date(v))}
            tick={{ fontSize: 10, fill: '#71717a' }}
            stroke="#3f3f46"
            tickLine={false}
            minTickGap={30}
          />
          <YAxis
            domain={yDomain}
            tick={{ fontSize: 10, fill: '#71717a' }}
            stroke="#3f3f46"
            tickLine={false}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
            width={50}
          />
          <ReferenceLine y={0} stroke="#52525b" strokeDasharray="4 4" />
          <Tooltip
            cursor={{ stroke: '#a1a1aa', strokeWidth: 1, strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: '#a1a1aa' }}
            itemStyle={{ color: '#e4e4e7' }}
            labelFormatter={(v) => new Date(v as number).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
            formatter={(_, __, item) => {
              const p = item.payload as Point
              return [`${p.drawdownPct.toFixed(2)}% (${p.drawdown.toFixed(2)})`, 'Drawdown']
            }}
          />
          <Area
            type="monotone"
            dataKey="drawdownPct"
            stroke="#fb923c"
            strokeWidth={2}
            fill="url(#drawdownGradient)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
