'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAccounts } from '@/hooks/useAccounts'
import { useActiveAccount } from '@/contexts/ActiveAccountContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Plus, Wallet, Trash2, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export default function AccountsPage() {
  const { accounts, loading, deleteAccount } = useAccounts()
  const { activeAccount, setActiveAccount } = useActiveAccount()
  const [busyId, setBusyId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Hapus akun ini? Semua trade di akun ini juga akan terhapus.')) return
    setBusyId(id)
    const { error } = await deleteAccount(id)
    setBusyId(null)
    if (error) toast.error('Gagal hapus akun', { description: error })
    else toast.success('Akun dihapus')
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Wallet className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Akun Trading</h2>
          <Badge variant="outline" className="text-zinc-500 border-zinc-700 text-xs">
            {accounts.length} akun
          </Badge>
        </div>
        <Link href="/accounts/new" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4">
          <Plus className="h-4 w-4" /> Akun Baru
        </Link>
      </div>

      {accounts.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6 text-center space-y-3">
            <CardDescription className="text-zinc-500 text-sm">
              Belum ada akun trading. Buat akun pertamamu untuk mulai mencatat trade.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {accounts.map(acc => {
            const isActive = activeAccount?.id === acc.id
            return (
              <Card key={acc.id} className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm text-zinc-100 flex items-center gap-2 flex-wrap">
                        <span className="truncate">{acc.name}</span>
                        {isActive && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                            <Check className="h-2.5 w-2.5 mr-0.5" /> Aktif
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-zinc-500 text-xs mt-1">
                        {acc.broker ? `${acc.broker} • ` : ''}
                        {acc.currency} • {formatCurrency(acc.initial_balance)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1.5 shrink-0 w-full sm:w-auto">
                      {!isActive && (
                        <Button
                          onClick={() => setActiveAccount(acc.id)}
                          variant="outline"
                          className="h-9 text-xs border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 flex-1 sm:flex-none"
                        >
                          Jadikan aktif
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDelete(acc.id)}
                        disabled={busyId === acc.id}
                        variant="outline"
                        className="h-9 w-9 p-0 border-zinc-700 bg-zinc-800 text-red-400 hover:bg-red-500/10 shrink-0"
                      >
                        {busyId === acc.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
