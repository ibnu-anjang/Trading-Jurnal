import { createClient } from '@/lib/supabase/server'
import { ListOrdered } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function TradesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user!.id)
    .order('trade_date', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListOrdered className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-zinc-100">All Trades</h2>
          <Badge variant="outline" className="text-zinc-400 border-zinc-700">
            {trades?.length ?? 0} trades
          </Badge>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-4">
          {!trades || trades.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-zinc-600 gap-2">
              <ListOrdered className="h-8 w-8" />
              <p className="text-sm">Belum ada trade yang tercatat.</p>
              <p className="text-xs text-zinc-700">Form input trade akan hadir di Fase 2.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Tanggal', 'Symbol', 'Arah', 'Entry', 'Close', 'Size', 'Net P/L', 'Status'].map(h => (
                      <th key={h} className="text-left py-3 px-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {trades.map(t => (
                    <tr key={t.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3 px-3 text-zinc-300">{new Date(t.trade_date).toLocaleDateString('id-ID')}</td>
                      <td className="py-3 px-3 text-zinc-100 font-medium">{t.symbol}</td>
                      <td className="py-3 px-3">
                        <Badge className={t.direction === 'Long' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}>
                          {t.direction}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-zinc-300">{t.entry_price}</td>
                      <td className="py-3 px-3 text-zinc-300">{t.close_price}</td>
                      <td className="py-3 px-3 text-zinc-300">{t.size}</td>
                      <td className={`py-3 px-3 font-medium ${t.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        ${t.net?.toFixed(2)}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
