'use client'

import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid,
} from 'recharts'
import type { Trade } from '@/types/trade'

interface Props {
  trades: Trade[]            // urutan apapun; akan di-sort by trade_date ascending
  startingCapital: number
  currency: string
}

interface Point {
  ts: number                 // epoch ms (untuk x-axis numeric)
  dateLabel: string          // tampilan tooltip
  equity: number
}

function formatShortDate(d: Date) {
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}

export default function EquityCurve({ trades, startingCapital, currency }: Props) {
  const data = useMemo<Point[]>(() => {
    if (trades.length === 0) return []
    const sorted = [...trades].sort(
      (a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
    )
    const firstTs = new Date(sorted[0].trade_date).getTime()
    let running = startingCapital
    const points: Point[] = [
      { ts: firstTs - 1, dateLabel: 'Start', equity: startingCapital },
    ]
    sorted.forEach(t => {
      running += t.net ?? 0
      const d = new Date(t.trade_date)
      points.push({
        ts: d.getTime(),
        dateLabel: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }),
        equity: running,
      })
    })
    return points
  }, [trades, startingCapital])

  if (data.length === 0) {
    return (
      <div className="h-56 sm:h-72 flex flex-col items-center justify-center text-zinc-600 gap-2 text-sm">
        Belum ada trade. Tambah trade pertamamu untuk lihat equity curve.
      </div>
    )
  }

  const minEquity = Math.min(...data.map(p => p.equity))
  const maxEquity = Math.max(...data.map(p => p.equity))
  const padding = Math.max((maxEquity - minEquity) * 0.1, 1)
  const yDomain: [number, number] = [
    Math.floor(minEquity - padding),
    Math.ceil(maxEquity + padding),
  ]

  const finalEquity = data[data.length - 1].equity
  const gain = finalEquity - startingCapital
  const isUp = gain >= 0
  const stroke = isUp ? '#34d399' : '#f87171'
  const gradientId = 'equityGradient'

  return (
    <div className="h-56 sm:h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stroke} stopOpacity={0.3} />
              <stop offset="95%" stopColor={stroke} stopOpacity={0} />
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
            tickFormatter={(v) => {
              const abs = Math.abs(v)
              if (abs >= 1000) return `${(v / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`
              return v.toFixed(0)
            }}
            width={50}
          />
          <ReferenceLine
            y={startingCapital}
            stroke="#52525b"
            strokeDasharray="4 4"
            label={{ value: 'Start', fill: '#71717a', fontSize: 10, position: 'insideTopRight' }}
          />
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
            formatter={(v) => {
              const equity = Number(v) || 0
              const delta = equity - startingCapital
              const sign = delta >= 0 ? '+' : ''
              const fmt = (n: number) => n.toLocaleString('id-ID', { maximumFractionDigits: 2 })
              return [`${currency} ${fmt(equity)} (${sign}${fmt(delta)})`, 'Equity']
            }}
          />
          <Line
            type="monotone"
            dataKey="equity"
            stroke={stroke}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            fill={`url(#${gradientId})`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
