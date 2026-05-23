'use client'

import { useState } from 'react'
import { Trade } from '@/types/trade'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Search, ChevronUp, ChevronDown } from 'lucide-react'
import { formatDateTime, formatCurrency } from '@/lib/utils'

interface Props {
  trades: Trade[]
  onDelete: (id: string) => Promise<{ error: string | null }>
}

type SortKey = 'trade_date' | 'symbol' | 'net' | 'emotion_score'
type SortDir = 'asc' | 'desc'

export default function TradeTable({ trades, onDelete }: Props) {
  const [search, setSearch] = useState('')
  const [filterDir, setFilterDir] = useState('all')
  const [filterWL, setFilterWL] = useState('all')
  const [filterSymbol, setFilterSymbol] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('trade_date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [deleting, setDeleting] = useState<string | null>(null)

  const symbols = ['all', ...Array.from(new Set(trades.map(t => t.symbol)))]

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = trades
    .filter(t => {
      const q = search.toLowerCase()
      const matchSearch = !q || t.symbol.toLowerCase().includes(q) || (t.reason_entry ?? '').toLowerCase().includes(q)
      const matchDir = filterDir === 'all' || t.direction === filterDir
      const matchWL = filterWL === 'all' || t.win_loss === filterWL
      const matchSym = filterSymbol === 'all' || t.symbol === filterSymbol
      return matchSearch && matchDir && matchWL && matchSym
    })
    .sort((a, b) => {
      let va: number | string = a[sortKey] ?? 0
      let vb: number | string = b[sortKey] ?? 0
      if (sortKey === 'trade_date') { va = a.trade_date; vb = b.trade_date }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const totalNet = filtered.reduce((s, t) => s + (t.net ?? 0), 0)
  const wins = filtered.filter(t => t.win_loss === 'Win').length
  const losses = filtered.filter(t => t.win_loss === 'Loss').length

  async function handleDelete(id: string) {
    setDeleting(id)
    await onDelete(id)
    setDeleting(null)
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp className="h-3 w-3 opacity-20" />
    return sortDir === 'asc'
      ? <ChevronUp className="h-3 w-3 text-emerald-400" />
      : <ChevronDown className="h-3 w-3 text-emerald-400" />
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="space-y-2 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
        {/* Search (full-width di mobile) */}
        <div className="relative sm:flex-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <Input
            placeholder="Cari symbol / alasan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-zinc-800 border-zinc-700 text-zinc-100 w-full sm:w-52 h-9 text-sm"
          />
        </div>

        {/* Filters: 3 kolom rata di mobile, auto-width di sm+ */}
        <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3 sm:contents">
          <Select value={filterSymbol} onValueChange={v => v && setFilterSymbol(v)}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-300 h-9 w-full sm:w-32 text-sm min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {symbols.map(s => (
                <SelectItem key={s} value={s} className="text-zinc-100 focus:bg-zinc-700">
                  {s === 'all' ? 'Semua Symbol' : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterDir} onValueChange={v => v && setFilterDir(v)}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-300 h-9 w-full sm:w-32 text-sm min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="all" className="text-zinc-100 focus:bg-zinc-700">Semua Arah</SelectItem>
              <SelectItem value="Long" className="text-emerald-400 focus:bg-zinc-700">Long</SelectItem>
              <SelectItem value="Short" className="text-red-400 focus:bg-zinc-700">Short</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterWL} onValueChange={v => v && setFilterWL(v)}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-300 h-9 w-full sm:w-32 text-sm min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="all" className="text-zinc-100 focus:bg-zinc-700">Semua Status</SelectItem>
              <SelectItem value="Win" className="text-emerald-400 focus:bg-zinc-700">Win</SelectItem>
              <SelectItem value="Loss" className="text-red-400 focus:bg-zinc-700">Loss</SelectItem>
              <SelectItem value="Breakeven" className="text-zinc-400 focus:bg-zinc-700">Breakeven</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary bar (di baris sendiri di mobile, kanan di desktop) */}
        <div className="sm:ml-auto flex items-center justify-between sm:justify-end gap-3 sm:gap-4 text-xs sm:text-sm pt-1 sm:pt-0 border-t sm:border-0 border-zinc-800">
          <span className="text-zinc-500">{filtered.length} trades</span>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-emerald-400">{wins}W</span>
            <span className="text-red-400">{losses}L</span>
            <span className={`font-semibold tabular-nums ${totalNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalNet >= 0 ? '+' : ''}{formatCurrency(totalNet)}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-zinc-600 text-sm border border-zinc-800 rounded-lg">
            Tidak ada trade ditemukan
          </div>
        )}
        {filtered.map(t => (
          <div key={t.id} className="border border-zinc-800 rounded-lg p-3 bg-zinc-900/50 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-100 text-sm">{t.symbol}</span>
                  <Badge className={t.direction === 'Long'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0'
                    : 'bg-red-500/10 text-red-400 border-red-500/20 text-[10px] px-1.5 py-0'}>
                    {t.direction}
                  </Badge>
                  <Badge className={
                    t.win_loss === 'Win'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0'
                      : t.win_loss === 'Loss'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20 text-[10px] px-1.5 py-0'
                      : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20 text-[10px] px-1.5 py-0'
                  }>
                    {t.win_loss}
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">{formatDateTime(t.trade_date)}</p>
              </div>
              <div className={`text-right shrink-0 ${(t.net ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                <p className="font-bold tabular-nums text-sm">
                  {(t.net ?? 0) >= 0 ? '+' : ''}{formatCurrency(t.net ?? 0)}
                </p>
                <p className="text-[10px] text-zinc-500 tabular-nums">
                  {(t.points ?? 0) > 0 ? '+' : ''}{t.points?.toFixed(2)} pts
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <p className="text-zinc-600 uppercase tracking-wider">Entry</p>
                <p className="text-zinc-300 tabular-nums">{t.entry_price}</p>
              </div>
              <div>
                <p className="text-zinc-600 uppercase tracking-wider">Close</p>
                <p className="text-zinc-300 tabular-nums">{t.close_price}</p>
              </div>
              <div>
                <p className="text-zinc-600 uppercase tracking-wider">Size</p>
                <p className="text-zinc-300 tabular-nums">{t.size}</p>
              </div>
            </div>

            {(t.reason_entry || t.emotion_score != null || t.rule_followed != null) && (
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2 text-[11px]">
                <p className="text-zinc-400 truncate flex-1">{t.reason_entry ?? '—'}</p>
                <div className="flex items-center gap-2 shrink-0">
                  {t.emotion_score != null && (
                    <span className="text-zinc-400">{t.emotion_score}/10</span>
                  )}
                  {t.rule_followed != null && (
                    <span className={t.rule_followed ? 'text-emerald-400' : 'text-red-400'}>
                      {t.rule_followed ? '✅' : '❌'}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(t.id)}
                disabled={deleting === t.id}
                className="h-7 px-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 text-[11px]"
              >
                <Trash2 className="h-3 w-3 mr-1" /> Hapus
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800/60">
            <tr>
              {[
                { label: 'Tanggal', key: 'trade_date' as SortKey },
                { label: 'Symbol', key: 'symbol' as SortKey },
              ].map(({ label, key }) => (
                <th
                  key={key}
                  onClick={() => toggleSort(key)}
                  className="text-left py-3 px-3 text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 select-none"
                >
                  <span className="flex items-center gap-1">{label}<SortIcon k={key} /></span>
                </th>
              ))}
              {['Arah', 'Entry', 'Close', 'Points', 'Size', 'Gross P/L', 'Fee'].map(h => (
                <th key={h} className="text-left py-3 px-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
              <th
                onClick={() => toggleSort('net')}
                className="text-left py-3 px-3 text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-300 select-none"
              >
                <span className="flex items-center gap-1">Net P/L<SortIcon k="net" /></span>
              </th>
              {['Status', 'Emosi', 'Rules', 'Alasan', ''].map((h, i) => (
                <th key={i} className="text-left py-3 px-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={15} className="text-center py-12 text-zinc-600">
                  Tidak ada trade ditemukan
                </td>
              </tr>
            )}
            {filtered.map(t => (
              <tr key={t.id} className="hover:bg-zinc-800/40 transition-colors group">
                <td className="py-3 px-3 text-zinc-400 whitespace-nowrap text-xs">
                  {formatDateTime(t.trade_date)}
                </td>
                <td className="py-3 px-3 font-semibold text-zinc-100">{t.symbol}</td>
                <td className="py-3 px-3">
                  <Badge className={t.direction === 'Long'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'}>
                    {t.direction}
                  </Badge>
                </td>
                <td className="py-3 px-3 text-zinc-300 tabular-nums">{t.entry_price}</td>
                <td className="py-3 px-3 text-zinc-300 tabular-nums">{t.close_price}</td>
                <td className={`py-3 px-3 tabular-nums font-medium ${(t.points ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(t.points ?? 0) > 0 ? '+' : ''}{t.points?.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-zinc-300 tabular-nums">{t.size}</td>
                <td className={`py-3 px-3 tabular-nums ${(t.value ?? 0) >= 0 ? 'text-zinc-300' : 'text-zinc-300'}`}>
                  {formatCurrency(t.value ?? 0)}
                </td>
                <td className="py-3 px-3 text-zinc-500 tabular-nums">{formatCurrency(t.fee ?? 0)}</td>
                <td className={`py-3 px-3 font-bold tabular-nums ${(t.net ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(t.net ?? 0) >= 0 ? '+' : ''}{formatCurrency(t.net ?? 0)}
                </td>
                <td className="py-3 px-3">
                  <Badge className={
                    t.win_loss === 'Win'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : t.win_loss === 'Loss'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                  }>
                    {t.win_loss}
                  </Badge>
                </td>
                <td className="py-3 px-3 text-center">
                  {t.emotion_score != null ? (
                    <span className="text-xs font-medium text-zinc-300">
                      {t.emotion_score}/10 {t.emotion_score <= 3 ? '😰' : t.emotion_score <= 6 ? '😐' : '😎'}
                    </span>
                  ) : <span className="text-zinc-700">—</span>}
                </td>
                <td className="py-3 px-3 text-center">
                  {t.rule_followed == null
                    ? <span className="text-zinc-700">—</span>
                    : t.rule_followed
                    ? <span className="text-emerald-400 text-xs font-medium">✅ Ya</span>
                    : <span className="text-red-400 text-xs font-medium">❌ Tidak</span>}
                </td>
                <td className="py-3 px-3 max-w-[200px]">
                  {t.reason_entry
                    ? <span className="text-zinc-400 text-xs truncate block" title={t.reason_entry}>{t.reason_entry}</span>
                    : <span className="text-zinc-700">—</span>}
                </td>
                <td className="py-3 px-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(t.id)}
                    disabled={deleting === t.id}
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
