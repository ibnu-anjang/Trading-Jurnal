'use client'

import { useMemo } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, CartesianGrid, Cell,
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
  dailyNet: number           // sum P/L hari itu (untuk bar)
  equity: number             // cumulative (untuk line)
}

function formatShortDate(d: Date) {
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}

export default function EquityCurve({ trades, startingCapital, currency }: Props) {
  const data = useMemo<Point[]>(() => {
    if (trades.length === 0) return []
    // Bucket per hari (YYYY-MM-DD)
    const dayMap: Record<string, { ts: number; net: number }> = {}
    trades.forEach(t => {
      const d = new Date(t.trade_date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      if (!dayMap[key]) {
        // Pakai start-of-day biar ts konsisten per hari
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        dayMap[key] = { ts: dayStart.getTime(), net: 0 }
      }
      dayMap[key].net += t.net ?? 0
    })
    const sorted = Object.values(dayMap).sort((a, b) => a.ts - b.ts)
    let running = startingCapital
    return sorted.map(({ ts, net }) => {
      running += net
      const d = new Date(ts)
      return {
        ts,
        dateLabel: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }),
        dailyNet: net,
        equity: running,
      }
    })
  }, [trades, startingCapital])

  if (data.length === 0) {
    return (
      <div className="h-56 sm:h-72 flex flex-col items-center justify-center text-zinc-600 gap-2 text-sm">
        Belum ada trade. Tambah trade pertamamu untuk lihat equity curve.
      </div>
    )
  }

  const finalEquity = data[data.length - 1].equity
  const gain = finalEquity - startingCapital
  const isUp = gain >= 0
  const lineStroke = isUp ? '#34d399' : '#f87171'

  // Domain bar (kiri): symmetric around 0 biar bar profit/loss balance visual
  const maxAbsDaily = Math.max(...data.map(p => Math.abs(p.dailyNet)), 1)
  const barDomain: [number, number] = [-maxAbsDaily * 1.1, maxAbsDaily * 1.1]

  // Domain line (kanan): equity dengan padding
  const minEquity = Math.min(...data.map(p => p.equity), startingCapital)
  const maxEquity = Math.max(...data.map(p => p.equity), startingCapital)
  const eqPad = Math.max((maxEquity - minEquity) * 0.1, 1)
  const eqDomain: [number, number] = [
    Math.floor(minEquity - eqPad),
    Math.ceil(maxEquity + eqPad),
  ]

  const fmt = (n: number) => n.toLocaleString('id-ID', { maximumFractionDigits: 2 })

  return (
    <div className="h-56 sm:h-72 w-full">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="ts"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(v) => formatShortDate(new Date(v))}
            tick={{ fontSize: 10, fill: '#71717a' }}
            stroke="#3f3f46"
            tickLine={false}
            minTickGap={30}
          />
          {/* Y kiri = daily P/L (bar) */}
          <YAxis
            yAxisId="bar"
            domain={barDomain}
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
          {/* Y kanan = equity (line) */}
          <YAxis
            yAxisId="line"
            orientation="right"
            domain={eqDomain}
            tick={{ fontSize: 10, fill: '#a1a1aa' }}
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
            yAxisId="bar"
            y={0}
            stroke="#52525b"
            strokeWidth={1}
          />
          <ReferenceLine
            yAxisId="line"
            y={startingCapital}
            stroke="#52525b"
            strokeDasharray="4 4"
            label={{ value: 'Start', fill: '#71717a', fontSize: 10, position: 'insideTopRight' }}
          />
          <Tooltip
            cursor={{ fill: '#27272a', opacity: 0.4 }}
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: '#a1a1aa' }}
            itemStyle={{ color: '#e4e4e7' }}
            labelFormatter={(v) => new Date(v as number).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
            formatter={(value, name) => {
              const v = Number(value) || 0
              if (name === 'P/L Harian') {
                const sign = v >= 0 ? '+' : ''
                return [`${currency} ${sign}${fmt(v)}`, name]
              }
              // Equity
              const delta = v - startingCapital
              const sign = delta >= 0 ? '+' : ''
              return [`${currency} ${fmt(v)} (${sign}${fmt(delta)})`, name]
            }}
          />
          <Bar
            yAxisId="bar"
            dataKey="dailyNet"
            name="P/L Harian"
            radius={[2, 2, 0, 0]}
            maxBarSize={24}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.dailyNet >= 0 ? '#10b98180' : '#ef444480'} />
            ))}
          </Bar>
          <Line
            yAxisId="line"
            type="monotone"
            dataKey="equity"
            name="Equity"
            stroke={lineStroke}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
