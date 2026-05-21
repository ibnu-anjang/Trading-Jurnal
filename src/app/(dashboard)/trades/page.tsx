'use client'

import { useTrades } from '@/hooks/useTrades'
import AddTradeModal from '@/components/trades/AddTradeModal'
import TradeTable from '@/components/trades/TradeTable'
import { Badge } from '@/components/ui/badge'
import { ListOrdered, Loader2 } from 'lucide-react'

export default function TradesPage() {
  const { trades, loading, addTrade, deleteTrade } = useTrades()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ListOrdered className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-zinc-100">All Trades</h2>
          <Badge variant="outline" className="text-zinc-500 border-zinc-700 text-xs">
            {trades.length} total
          </Badge>
        </div>
        <AddTradeModal onAdd={addTrade} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-zinc-600 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Memuat trades...</span>
        </div>
      ) : (
        <TradeTable trades={trades} onDelete={deleteTrade} />
      )}
    </div>
  )
}
