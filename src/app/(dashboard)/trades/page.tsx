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
import { ListOrdered, Loader2, Wallet } from 'lucide-react'
import type { Trade } from '@/types/trade'

export default function TradesPage() {
  const { activeAccount } = useActiveAccount()
  const { trades, loading, addTrade, updateTrade, deleteTrade } = useTrades(activeAccount?.id ?? null)
  const { symbols } = useSymbols()
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)

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
        <AddTradeModal onAdd={addTrade} symbols={symbolNames} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-zinc-600 gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Memuat trades...</span>
        </div>
      ) : (
        <TradeTable trades={trades} onDelete={deleteTrade} onRowClick={setSelectedTrade} />
      )}

      <TradeDetailModal
        trade={selectedTrade}
        open={!!selectedTrade}
        onClose={() => setSelectedTrade(null)}
        onUpdate={updateTrade}
        onDelete={deleteTrade}
        symbols={symbolNames}
      />
    </div>
  )
}
