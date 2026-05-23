import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getActiveAccount } from '@/lib/active-account'
import { CalendarDays, Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function CalendarPage() {
  const { account } = await getActiveAccount()

  if (!account) {
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

  const supabase = await createClient()
  const { data: trades } = await supabase
    .from('trades')
    .select('trade_date, net, win_loss')
    .eq('account_id', account.id)

  // Agregasi P/L per hari
  const dailyMap: Record<string, { net: number; count: number }> = {}
  trades?.forEach(t => {
    const day = t.trade_date.slice(0, 10)
    if (!dailyMap[day]) dailyMap[day] = { net: 0, count: 0 }
    dailyMap[day].net += t.net ?? 0
    dailyMap[day].count += 1
  })

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  const blanks = Array(firstDay).fill(null)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-emerald-400" />
        <h2 className="text-lg font-semibold text-zinc-100">
          {monthNames[month]} {year}
        </h2>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50" /> Profit</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/30 border border-red-500/50" /> Loss</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-zinc-800 border border-zinc-700" /> No Trade</span>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map(d => (
              <div key={d} className="text-center text-xs font-medium text-zinc-500 py-2">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((_, i) => <div key={`blank-${i}`} />)}
            {days.map(day => {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const data = dailyMap[dateStr]
              const isToday = day === now.getDate()

              let cellClass = 'bg-zinc-800 border-zinc-700'
              if (data) {
                cellClass = data.net >= 0
                  ? 'bg-emerald-500/20 border-emerald-500/40'
                  : 'bg-red-500/20 border-red-500/40'
              }

              return (
                <div
                  key={day}
                  className={`rounded-lg border p-1.5 min-h-[72px] flex flex-col ${cellClass} ${isToday ? 'ring-1 ring-emerald-400' : ''}`}
                >
                  <span className={`text-xs font-bold ${isToday ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    {day}
                  </span>
                  {data && (
                    <>
                      <span className="text-[10px] text-zinc-500 mt-auto">{data.count} trade{data.count > 1 ? 's' : ''}</span>
                      <span className={`text-[11px] font-semibold ${data.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {data.net >= 0 ? '+' : ''}${data.net.toFixed(0)}
                      </span>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
