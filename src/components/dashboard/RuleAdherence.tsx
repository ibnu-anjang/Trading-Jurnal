'use client'

import { ShieldCheck, ShieldAlert } from 'lucide-react'
import type { Trade } from '@/types/trade'

interface Props {
  trades: Trade[]
}

function statsFor(trades: Trade[]) {
  const count = trades.length
  const net = trades.reduce((s, t) => s + (t.net ?? 0), 0)
  const wins = trades.filter(t => t.win_loss === 'Win').length
  const winRate = count > 0 ? (wins / count) * 100 : 0
  const expectancy = count > 0 ? net / count : 0
  return { count, net, winRate, expectancy }
}

export default function RuleAdherence({ trades }: Props) {
  const followed = statsFor(trades.filter(t => t.rule_followed === true))
  const broken = statsFor(trades.filter(t => t.rule_followed === false))
  const unrecorded = trades.filter(t => t.rule_followed == null).length
  const recorded = followed.count + broken.count

  if (recorded === 0) {
    return (
      <p className="text-sm text-zinc-500 py-4 text-center">
        Belum ada trade dengan field <span className="text-zinc-300">Rule Followed</span> dicatat.
        Isi field itu saat input/edit trade untuk lihat selisih P/L patuh vs langgar aturan.
      </p>
    )
  }

  const netDelta = followed.net - broken.net
  const expDelta = followed.expectancy - broken.expectancy

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 sm:p-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">Patuh Rule</span>
          </div>
          <p className={`text-lg sm:text-2xl font-bold tabular-nums mt-2 ${followed.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${followed.net.toFixed(2)}
          </p>
          <dl className="mt-2 space-y-0.5 text-[11px] sm:text-xs text-zinc-400 tabular-nums">
            <div className="flex justify-between"><dt>Trade</dt><dd className="text-zinc-300">{followed.count}</dd></div>
            <div className="flex justify-between"><dt>Win rate</dt><dd className="text-zinc-300">{followed.winRate.toFixed(1)}%</dd></div>
            <div className="flex justify-between"><dt>Expectancy</dt><dd className={followed.expectancy >= 0 ? 'text-emerald-400' : 'text-red-400'}>${followed.expectancy.toFixed(2)}</dd></div>
          </dl>
        </div>

        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 sm:p-4">
          <div className="flex items-center gap-2 text-red-400">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">Langgar Rule</span>
          </div>
          <p className={`text-lg sm:text-2xl font-bold tabular-nums mt-2 ${broken.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${broken.net.toFixed(2)}
          </p>
          <dl className="mt-2 space-y-0.5 text-[11px] sm:text-xs text-zinc-400 tabular-nums">
            <div className="flex justify-between"><dt>Trade</dt><dd className="text-zinc-300">{broken.count}</dd></div>
            <div className="flex justify-between"><dt>Win rate</dt><dd className="text-zinc-300">{broken.winRate.toFixed(1)}%</dd></div>
            <div className="flex justify-between"><dt>Expectancy</dt><dd className={broken.expectancy >= 0 ? 'text-emerald-400' : 'text-red-400'}>${broken.expectancy.toFixed(2)}</dd></div>
          </dl>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 text-xs sm:text-sm">
        <p className="text-zinc-300">
          Disiplin bernilai{' '}
          <span className={`font-semibold tabular-nums ${netDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${netDelta.toFixed(2)}
          </span>{' '}
          dalam total P/L dan{' '}
          <span className={`font-semibold tabular-nums ${expDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${expDelta.toFixed(2)}
          </span>{' '}
          per trade — selisih patuh vs langgar aturan.
        </p>
        {unrecorded > 0 && (
          <p className="text-zinc-500 mt-1">{unrecorded} trade belum dicatat status rule-nya (tidak dihitung).</p>
        )}
      </div>
    </div>
  )
}
