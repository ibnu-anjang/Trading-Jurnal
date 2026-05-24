'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAccounts } from '@/hooks/useAccounts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Wallet, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const CURRENCIES = ['USD', 'IDR', 'EUR', 'GBP', 'JPY', 'AUD', 'SGD']
const ACTIVE_ACCOUNT_COOKIE = 'active_account_id'

export default function NewAccountPage() {
  const router = useRouter()
  const { addAccount, accounts } = useAccounts()
  const [name, setName] = useState('')
  const [broker, setBroker] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [balance, setBalance] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const bal = parseFloat(balance)
    if (!name.trim()) { setError('Nama akun wajib diisi'); return }
    if (isNaN(bal) || bal < 0) { setError('Initial balance tidak valid'); return }
    setBusy(true); setError(null)
    const { error: err, data } = await addAccount({
      name: name.trim(),
      broker: broker.trim() || null,
      currency,
      initial_balance: bal,
    })
    if (err || !data) {
      const msg = err ?? 'Gagal membuat akun'
      setError(msg)
      toast.error('Gagal membuat akun', { description: msg })
      setBusy(false)
      return
    }
    toast.success(`Akun "${name.trim()}" berhasil dibuat`)
    // Auto-switch hanya kalau ini akun pertama. Kalau user udah punya akun aktif,
    // tetap di akun lama supaya gak ganggu konteks kerja.
    const isFirstAccount = accounts.length === 0
    if (isFirstAccount) {
      document.cookie = `${ACTIVE_ACCOUNT_COOKIE}=${data.id}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
      router.push('/')
    } else {
      router.push('/accounts')
    }
    // Refresh agar layout server component fetch ulang accounts → AccountSwitcher di header langsung tampilkan akun baru
    router.refresh()
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-5 w-5 text-emerald-400" />
            <CardTitle className="text-zinc-100 text-base">Buat Akun Trading</CardTitle>
          </div>
          <CardDescription className="text-zinc-500 text-sm">
            Tiap akun datanya terpisah. Bisa bikin beberapa akun (live, demo, broker berbeda).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500 uppercase tracking-wide">Nama Akun</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Akun Live Utama" autoFocus className="bg-zinc-800 border-zinc-700 h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500 uppercase tracking-wide">Broker (opsional)</Label>
              <Input value={broker} onChange={e => setBroker(e.target.value)} placeholder="IC Markets" className="bg-zinc-800 border-zinc-700 h-9" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-500 uppercase tracking-wide">Currency</Label>
                <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 h-9 px-2 rounded-md text-sm text-zinc-100">
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-500 uppercase tracking-wide">Initial Balance</Label>
                <Input type="number" step="any" value={balance} onChange={e => setBalance(e.target.value)} placeholder="10000" className="bg-zinc-800 border-zinc-700 h-9 tabular-nums" />
              </div>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <Button type="submit" disabled={busy} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-9 mt-2">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buat Akun'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
