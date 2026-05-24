'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTrades } from '@/hooks/useTrades'
import { useSymbols } from '@/hooks/useSymbols'
import { useActiveAccount } from '@/contexts/ActiveAccountContext'
import AddTradeModal from '@/components/trades/AddTradeModal'
import TradeTable from '@/components/trades/TradeTable'
import TradeDetailModal from '@/components/trades/TradeDetailModal'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ListOrdered, Wallet, Download } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { tradesToCSV, downloadCSV } from '@/lib/csv'
import { toast } from 'sonner'

export default function TradesPage() {
  const { activeAccount } = useActiveAccount()
  const { trades, loading, addTrade, updateTrade, updateScreenshots, deleteTrade } = useTrades(activeAccount?.id ?? null)
  const { symbols } = useSymbols()
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null)
  const selectedTrade = selectedTradeId ? trades.find(t => t.id === selectedTradeId) ?? null : null

  if (!activeAccount) {
    return (
      <Card className="bg-zinc-900 border-zinc-800 max-w-md mx-auto mt-10">
        <CardContent className="p-6 space-y-3 text-center">
          <Wallet className="h-8 w-8 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-100">Belum ada akun trading</h3>
          <p className="text-xs text-zinc-500">Buat akun trading dulu untuk mulai mencatat trade.</p>
          <Link href="/accounts/new" className="inline-flex h-9 items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4">
            Buat Akun
          </Link>
        </CardContent>
      </Card>
    )
  }

  const symbolNames = symbols.length > 0
    ? symbols.map(s => s.name)
    : ['NQ', 'ES', 'YM', 'RTY', 'CL', 'GC', 'EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD']

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ListOrdered className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-zinc-100">All Trades</h2>
          <Badge variant="outline" className="text-zinc-500 border-zinc-700 text-xs">
            {trades.length} total
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (trades.length === 0) {
                toast.error('Belum ada trade untuk di-export')
                return
              }
              const csv = tradesToCSV(trades)
              const fname = `trades-${activeAccount.name.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.csv`
              downloadCSV(fname, csv)
              toast.success(`Export ${trades.length} trade`, { description: fname })
            }}
            className="h-9 border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
          <AddTradeModal onAdd={addTrade} symbols={symbolNames} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {/* Filter bar skeleton */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-full sm:w-28" />
            <Skeleton className="h-9 w-full sm:w-28" />
            <Skeleton className="h-9 w-full sm:w-28" />
          </div>
          {/* Row skeletons */}
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 sm:h-12 w-full" />
          ))}
        </div>
      ) : (
        <TradeTable trades={trades} onDelete={deleteTrade} onRowClick={(t) => setSelectedTradeId(t.id)} />
      )}

      <TradeDetailModal
        trade={selectedTrade}
        open={!!selectedTrade}
        onClose={() => setSelectedTradeId(null)}
        onUpdate={updateTrade}
        onUpdateScreenshots={updateScreenshots}
        onDelete={deleteTrade}
        symbols={symbolNames}
      />
    </div>
  )
}
