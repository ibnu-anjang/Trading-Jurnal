'use client'

import { useState, useMemo, Fragment } from 'react'
import Link from 'next/link'
import { useActiveAccount } from '@/contexts/ActiveAccountContext'
import { useTrades } from '@/hooks/useTrades'
import { useSymbols } from '@/hooks/useSymbols'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CalendarDays, Wallet, ChevronLeft, ChevronRight, Loader2, ChevronDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Trade } from '@/types/trade'
import DayDetailModal from '@/components/calendar/DayDetailModal'
import TradeDetailModal from '@/components/trades/TradeDetailModal'

const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function CalendarPage() {
  const { activeAccount } = useActiveAccount()
  const { trades, loading, updateTrade, deleteTrade } = useTrades(activeAccount?.id ?? null)
  const { symbols } = useSymbols()
  const symbolNames = useMemo(() => symbols.map(s => s.name), [symbols])

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerYear, setPickerYear] = useState(now.getFullYear())

  const tradesByDate = useMemo(() => {
    const map: Record<string, Trade[]> = {}
    trades.forEach(t => {
      const day = t.trade_date.slice(0, 10)
      if (!map[day]) map[day] = []
      map[day].push(t)
    })
    return map
  }, [trades])

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()
  const daysInViewMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const weeks = useMemo(() => {
    type Cell = { day: number | null; ds: string }
    const cells: Cell[] = []
    for (let i = 0; i < firstDayOfMonth; i++) cells.push({ day: null, ds: '' })
    for (let d = 1; d <= daysInViewMonth; d++) cells.push({ day: d, ds: dateKey(viewYear, viewMonth, d) })
    while (cells.length % 7 !== 0) cells.push({ day: null, ds: '' })

    const result: Array<{ cells: Cell[]; net: number; tradesCount: number; tradingDays: number; weekNo: number }> = []
    for (let i = 0; i < cells.length; i += 7) {
      const weekCells = cells.slice(i, i + 7)
      let net = 0, tradesCount = 0, tradingDays = 0
      weekCells.forEach(c => {
        if (!c.day) return
        const dayTrades = tradesByDate[c.ds]
        if (dayTrades?.length) {
          tradingDays += 1
          tradesCount += dayTrades.length
          net += dayTrades.reduce((s, t) => s + (t.net ?? 0), 0)
        }
      })
      result.push({ cells: weekCells, net, tradesCount, tradingDays, weekNo: result.length + 1 })
    }
    return result
  }, [firstDayOfMonth, daysInViewMonth, viewYear, viewMonth, tradesByDate])

  const monthlySummary = useMemo(() => {
    let totalNet = 0
    let tradingDays = 0
    let winDays = 0
    let lossDays = 0
    let bestDay = { date: '', net: -Infinity }
    let worstDay = { date: '', net: Infinity }
    let totalTrades = 0

    Object.entries(tradesByDate).forEach(([date, dayTrades]) => {
      const [y, m] = date.split('-').map(Number)
      if (y !== viewYear || m - 1 !== viewMonth) return
      const dayNet = dayTrades.reduce((s, t) => s + (t.net ?? 0), 0)
      totalNet += dayNet
      tradingDays += 1
      totalTrades += dayTrades.length
      if (dayNet > 0) winDays += 1
      else if (dayNet < 0) lossDays += 1
      if (dayNet > bestDay.net) bestDay = { date, net: dayNet }
      if (dayNet < worstDay.net) worstDay = { date, net: dayNet }
    })

    return {
      totalNet,
      tradingDays,
      winDays,
      lossDays,
      totalTrades,
      bestDay: bestDay.net === -Infinity ? null : bestDay,
      worstDay: worstDay.net === Infinity ? null : worstDay,
    }
  }, [tradesByDate, viewYear, viewMonth])

  function navMonth(delta: number) {
    let m = viewMonth + delta
    let y = viewYear
    if (m < 0) { m = 11; y -= 1 }
    else if (m > 11) { m = 0; y += 1 }
    setViewMonth(m)
    setViewYear(y)
  }

  function goToday() {
    setViewYear(now.getFullYear())
    setViewMonth(now.getMonth())
  }

  function openPicker() {
    setPickerYear(viewYear)
    setPickerOpen(true)
  }

  function pickMonth(m: number) {
    setViewYear(pickerYear)
    setViewMonth(m)
    setPickerOpen(false)
  }

  if (!activeAccount) {
    return (
      <Card className="bg-zinc-900 border-zinc-800 max-w-md mx-auto mt-10">
        <CardContent className="p-6 space-y-3 text-center">
          <Wallet className="h-8 w-8 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-100">Belum ada akun trading</h3>
          <p className="text-xs text-zinc-500">Buat akun trading dulu untuk melihat calendar.</p>
          <Link href="/accounts/new" className="inline-flex h-9 items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4">
            Buat Akun
          </Link>
        </CardContent>
      </Card>
    )
  }

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth()

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header + navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={openPicker}
          className="flex items-center gap-2 min-w-0 group rounded-md px-2 py-1 -ml-2 hover:bg-zinc-800 transition-colors"
        >
          <CalendarDays className="h-5 w-5 text-emerald-400 shrink-0" />
          <h2 className="text-base sm:text-lg font-semibold text-zinc-100 truncate">
            {monthNames[viewMonth]} {viewYear}
          </h2>
          <ChevronDown className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navMonth(-1)}
            className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToday}
            disabled={isCurrentMonth}
            className="h-8 px-3 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-40"
          >
            Hari ini
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navMonth(1)}
            className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Monthly summary */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Total P/L</div>
            <div className={`text-lg sm:text-xl font-bold mt-1 ${monthlySummary.totalNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {monthlySummary.totalNet >= 0 ? '+' : ''}{formatCurrency(monthlySummary.totalNet)}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">{monthlySummary.totalTrades} trade</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Trading Days</div>
            <div className="text-lg sm:text-xl font-bold mt-1 text-zinc-100">{monthlySummary.tradingDays}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              <span className="text-emerald-400">{monthlySummary.winDays}W</span>
              <span className="text-zinc-700 mx-1">·</span>
              <span className="text-red-400">{monthlySummary.lossDays}L</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Best Day</div>
            <div className="text-sm sm:text-base font-bold mt-1 text-emerald-400">
              {monthlySummary.bestDay ? `+${formatCurrency(monthlySummary.bestDay.net)}` : '—'}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              {monthlySummary.bestDay ? monthlySummary.bestDay.date.slice(5) : 'belum ada'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Worst Day</div>
            <div className="text-sm sm:text-base font-bold mt-1 text-red-400">
              {monthlySummary.worstDay ? formatCurrency(monthlySummary.worstDay.net) : '—'}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              {monthlySummary.worstDay ? monthlySummary.worstDay.date.slice(5) : 'belum ada'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[11px] text-zinc-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50" /> Profit</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/30 border border-red-500/50" /> Loss</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-zinc-800 border border-zinc-700" /> No Trade</span>
      </div>

      {/* Calendar grid */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-4 px-2 sm:px-4 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/60 z-10 rounded-md">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
            </div>
          )}

          <div className="grid grid-cols-7 sm:grid-cols-[repeat(7,minmax(0,1fr))_70px] gap-0.5 sm:gap-1 mb-1">
            {dayNames.map(d => (
              <div key={d} className="text-center text-[10px] sm:text-xs font-medium text-zinc-500 py-1.5">{d}</div>
            ))}
            <div className="hidden sm:block text-center text-[10px] sm:text-xs font-medium text-zinc-500 py-1.5">Mingguan</div>
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-[repeat(7,minmax(0,1fr))_70px] gap-0.5 sm:gap-1">
            {weeks.map((week, wi) => (
              <Fragment key={wi}>
                {week.cells.map((cell, ci) => {
                  if (!cell.day) return <div key={`b-${wi}-${ci}`} />
                  const dayTrades = tradesByDate[cell.ds]
                  const isToday = isCurrentMonth && cell.day === now.getDate()
                  const dayNet = dayTrades?.reduce((s, t) => s + (t.net ?? 0), 0) ?? 0
                  const hasTrades = !!dayTrades?.length

                  let cellClass = 'bg-zinc-800/60 border-zinc-700/60 hover:bg-zinc-800'
                  if (hasTrades) {
                    cellClass = dayNet >= 0
                      ? 'bg-emerald-500/20 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-red-500/20 border-red-500/40 hover:bg-red-500/30'
                  }

                  return (
                    <button
                      key={cell.day}
                      type="button"
                      onClick={() => setSelectedDate(cell.ds)}
                      className={`rounded-md sm:rounded-lg border p-1 sm:p-1.5 min-h-[56px] sm:min-h-[78px] flex flex-col text-left transition-colors cursor-pointer ${cellClass} ${isToday ? 'ring-1 ring-emerald-400' : ''}`}
                    >
                      <span className={`text-[10px] sm:text-xs font-bold ${isToday ? 'text-emerald-400' : 'text-zinc-400'}`}>
                        {cell.day}
                      </span>
                      {hasTrades && (
                        <div className="mt-auto flex flex-col">
                          <span className="hidden sm:inline text-[10px] text-zinc-500">{dayTrades.length} trade{dayTrades.length > 1 ? 's' : ''}</span>
                          <span className={`text-[9px] sm:text-[11px] font-semibold leading-tight ${dayNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {dayNet >= 0 ? '+' : ''}${dayNet.toFixed(0)}
                          </span>
                        </div>
                      )}
                    </button>
                  )
                })}
                {/* Weekly summary cell (desktop only) */}
                <div className={`hidden sm:flex flex-col justify-center items-center rounded-lg border p-1.5 min-h-[78px] text-center ${
                  week.tradingDays === 0
                    ? 'bg-zinc-800/40 border-zinc-700/40 text-zinc-600'
                    : week.net >= 0
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                }`}>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wide">W{week.weekNo}</span>
                  <span className={`text-[11px] font-bold leading-tight mt-0.5 ${
                    week.tradingDays === 0
                      ? 'text-zinc-600'
                      : week.net >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {week.tradingDays === 0 ? '—' : `${week.net >= 0 ? '+' : ''}$${week.net.toFixed(0)}`}
                  </span>
                  {week.tradingDays > 0 && (
                    <span className="text-[9px] text-zinc-500 mt-0.5">{week.tradesCount}T · {week.tradingDays}d</span>
                  )}
                </div>
              </Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mobile-only weekly summary list */}
      <div className="sm:hidden space-y-1.5">
        <div className="text-[10px] text-zinc-500 uppercase tracking-wide px-1">Ringkasan Mingguan</div>
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className={`flex items-center justify-between rounded-md border px-3 py-2 ${
              week.tradingDays === 0
                ? 'bg-zinc-800/40 border-zinc-700/40'
                : week.net >= 0
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <span className="text-xs font-medium text-zinc-300">Minggu {week.weekNo}</span>
            <div className="flex items-center gap-3">
              {week.tradingDays > 0 && (
                <span className="text-[10px] text-zinc-500">{week.tradesCount}T · {week.tradingDays}d</span>
              )}
              <span className={`text-sm font-bold tabular-nums ${
                week.tradingDays === 0
                  ? 'text-zinc-600'
                  : week.net >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {week.tradingDays === 0 ? '—' : `${week.net >= 0 ? '+' : ''}$${week.net.toFixed(0)}`}
              </span>
            </div>
          </div>
        ))}
      </div>

      <DayDetailModal
        open={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        date={selectedDate}
        trades={selectedDate ? (tradesByDate[selectedDate] ?? []) : []}
        onTradeClick={(t) => {
          setSelectedTrade(t)
          setSelectedDate(null)
        }}
      />

      <TradeDetailModal
        trade={selectedTrade}
        open={!!selectedTrade}
        onClose={() => setSelectedTrade(null)}
        onUpdate={updateTrade}
        onDelete={deleteTrade}
        symbols={symbolNames}
      />

      {/* Month/year picker */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-xs p-0 gap-0">
          <DialogHeader className="px-5 pt-4 pb-3 border-b border-zinc-800">
            <DialogTitle className="text-sm">Pilih Bulan</DialogTitle>
          </DialogHeader>

          {/* Year stepper */}
          <div className="flex items-center justify-between px-3 py-3 border-b border-zinc-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPickerYear(y => y - 1)}
              className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              aria-label="Tahun sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-base font-semibold text-zinc-100 tabular-nums">{pickerYear}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPickerYear(y => y + 1)}
              className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              aria-label="Tahun berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Months grid */}
          <div className="grid grid-cols-3 gap-1.5 p-3">
            {monthNames.map((name, i) => {
              const isCurrent = pickerYear === viewYear && i === viewMonth
              const isToday = pickerYear === now.getFullYear() && i === now.getMonth()
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => pickMonth(i)}
                  className={`h-10 rounded-md text-xs font-medium transition-colors ${
                    isCurrent
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                      : isToday
                        ? 'bg-zinc-800 text-emerald-400 hover:bg-zinc-700 ring-1 ring-emerald-500/40'
                        : 'bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {name.slice(0, 3)}
                </button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
