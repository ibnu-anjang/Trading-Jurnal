'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { Trade } from '@/types/trade'
import { formatCurrency } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  date: string | null
  trades: Trade[]
  onTradeClick: (trade: Trade) => void
}

const monthLabels = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

function formatDateLabel(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const dayNames = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
  return `${dayNames[date.getDay()]}, ${d} ${monthLabels[m - 1]} ${y}`
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function DayDetailModal({ open, onClose, date, trades, onTradeClick }: Props) {
  if (!date) return null

  const totalNet = trades.reduce((s, t) => s + (t.net ?? 0), 0)
  const wins = trades.filter(t => t.win_loss === 'Win').length
  const losses = trades.filter(t => t.win_loss === 'Loss').length

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-lg max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-zinc-800 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-emerald-400" />
            {formatDateLabel(date)}
          </DialogTitle>
        </DialogHeader>

        {/* Day summary */}
        <div className="px-6 py-3 border-b border-zinc-800 shrink-0 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Net P/L</div>
            <div className={`text-sm font-bold mt-0.5 ${totalNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalNet >= 0 ? '+' : ''}{formatCurrency(totalNet)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Trades</div>
            <div className="text-sm font-bold mt-0.5 text-zinc-100">{trades.length}</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">W / L</div>
            <div className="text-sm font-bold mt-0.5 text-zinc-100">
              <span className="text-emerald-400">{wins}</span>
              <span className="text-zinc-600 mx-1">/</span>
              <span className="text-red-400">{losses}</span>
            </div>
          </div>
        </div>

        {/* Trade list */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {trades.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-8">Tidak ada trade di hari ini.</p>
          ) : (
            <ul className="space-y-1.5">
              {trades.map(t => {
                const isWin = (t.net ?? 0) >= 0
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => onTradeClick(t)}
                      className="w-full text-left rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/60 hover:border-zinc-700 transition-colors px-3 py-2.5 flex items-center gap-3"
                    >
                      <div className={`shrink-0 w-7 h-7 rounded-md flex items-center justify-center ${
                        t.direction === 'Long' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                      }`}>
                        {t.direction === 'Long' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-zinc-100">{t.symbol}</span>
                          <Badge variant="outline" className="text-[9px] py-0 h-4 border-zinc-700 text-zinc-500 font-normal">
                            {formatTime(t.trade_date)}
                          </Badge>
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          {t.entry_price} → {t.close_price} · size {t.size}
                        </div>
                      </div>
                      <div className={`text-sm font-bold tabular-nums ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isWin ? '+' : ''}{formatCurrency(t.net ?? 0)}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
