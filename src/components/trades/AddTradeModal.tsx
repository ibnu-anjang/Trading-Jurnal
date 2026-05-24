'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Plus, Loader2, TrendingUp, TrendingDown, DollarSign, Brain } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { TradeInsert } from '@/types/trade'
import TagsInput from './TagsInput'
import { toast } from 'sonner'

interface Props {
  onAdd: (trade: TradeInsert) => Promise<{ error: string | null }>
  symbols?: string[]
}

const DEFAULT_SYMBOLS = ['NQ', 'ES', 'YM', 'RTY', 'CL', 'GC', 'EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD']

const defaultForm = {
  trade_date: new Date().toISOString().slice(0, 16),
  symbol: '',
  direction: '' as 'Long' | 'Short' | '',
  entry_price: '',
  close_price: '',
  size: '',
  value: '',
  fee: '0',
  reason_entry: '',
  emotion_score: '',
  rule_followed: '' as 'true' | 'false' | '',
  lesson_notes: '',
}

export default function AddTradeModal({ onAdd, symbols = DEFAULT_SYMBOLS }: Props) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rawDiff = (parseFloat(form.close_price) || 0) - (parseFloat(form.entry_price) || 0)
  const points = form.direction === 'Short' ? -rawDiff : rawDiff
  const grossAbs = Math.abs(parseFloat(form.value) || 0)
  // Tanda Gross P/L otomatis ngikut Points: kalau Points negatif, Gross jadi negatif.
  const gross = points < 0 ? -grossAbs : grossAbs
  const fee = parseFloat(form.fee) || 0
  const net = gross - fee
  const hasResult = form.value !== ''
  const isWin = net > 0
  const isLoss = net < 0

  function set(key: keyof typeof defaultForm, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function handleClose(val: boolean) {
    if (!val) { setForm(defaultForm); setTags([]); setError(null) }
    setOpen(val)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const missing: string[] = []
    if (!form.symbol) missing.push('Symbol')
    if (!form.direction) missing.push('Direction')
    if (!form.entry_price) missing.push('Entry Price')
    if (!form.close_price) missing.push('Close Price')
    if (!form.size) missing.push('Size')
    if (form.value === '') missing.push('Gross P/L')
    if (missing.length > 0) { setError(`Field wajib belum diisi: ${missing.join(', ')}`); return }
    setLoading(true)
    setError(null)

    const { error } = await onAdd({
      trade_date: new Date(form.trade_date).toISOString(),
      symbol: form.symbol.toUpperCase(),
      direction: form.direction as 'Long' | 'Short',
      entry_price: parseFloat(form.entry_price),
      close_price: parseFloat(form.close_price),
      size: parseFloat(form.size),
      value: gross,
      fee: parseFloat(form.fee) || 0,
      reason_entry: form.reason_entry || null,
      emotion_score: form.emotion_score ? parseInt(form.emotion_score) : null,
      rule_followed: form.rule_followed !== '' ? form.rule_followed === 'true' : null,
      lesson_notes: form.lesson_notes || null,
      tags,
    })

    if (error) { setError(error); toast.error('Gagal tambah trade', { description: error }); setLoading(false); return }
    handleClose(false)
    setLoading(false)
    toast.success('Trade berhasil ditambahkan')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 transition-colors shadow-lg shadow-emerald-900/30">
        <Plus className="h-4 w-4" />
        Tambah Trade
      </DialogTrigger>

      <DialogContent className="bg-zinc-900 border-zinc-800 p-0 gap-0 overflow-hidden flex flex-col
        max-sm:!max-w-none max-sm:!w-screen max-sm:!h-[100dvh] max-sm:!max-h-[100dvh] max-sm:!rounded-none max-sm:!top-0 max-sm:!left-0 max-sm:!translate-x-0 max-sm:!translate-y-0
        sm:max-w-xl sm:max-h-[90vh]">
        {/* Header strip warna sesuai hasil */}
        <div className={cn(
          'h-1 w-full shrink-0 transition-colors',
          hasResult
            ? isWin ? 'bg-emerald-500' : isLoss ? 'bg-red-500' : 'bg-zinc-600'
            : 'bg-zinc-700'
        )} />

        {/* Header tetap di atas */}
        <div className="px-6 pt-5 pb-3 shrink-0 border-b border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 text-sm font-semibold">Tambah Trade Baru</DialogTitle>
          </DialogHeader>
        </div>

        {/* Konten scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* === SECTION 1: Info Dasar === */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <Label className="text-xs text-zinc-500 uppercase tracking-wide">Tanggal & Waktu</Label>
                <Input
                  type="datetime-local"
                  value={form.trade_date}
                  onChange={e => set('trade_date', e.target.value)}
                  required
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-500 uppercase tracking-wide">Symbol</Label>
                <Select value={form.symbol} onValueChange={v => v && set('symbol', v)}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm">
                    <SelectValue placeholder="Pilih..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {symbols.map(s => (
                      <SelectItem key={s} value={s} className="text-zinc-100 focus:bg-zinc-700 text-sm">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-500 uppercase tracking-wide">Direction</Label>
                <Select value={form.direction} onValueChange={v => v && set('direction', v)}>
                  <SelectTrigger className={cn(
                    'h-9 text-sm border font-semibold',
                    form.direction === 'Long' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' :
                    form.direction === 'Short' ? 'bg-red-500/10 border-red-500/40 text-red-400' :
                    'bg-zinc-800 border-zinc-700 text-zinc-400'
                  )}>
                    <SelectValue placeholder="Long / Short" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="Long" className="text-emerald-400 font-semibold focus:bg-zinc-700">
                      <span className="flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5" />Long</span>
                    </SelectItem>
                    <SelectItem value="Short" className="text-red-400 font-semibold focus:bg-zinc-700">
                      <span className="flex items-center gap-2"><TrendingDown className="h-3.5 w-3.5" />Short</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="bg-zinc-800" />

            {/* === SECTION 2: Harga === */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-500 uppercase tracking-wide">Entry Price</Label>
                <Input type="number" step="any" placeholder="0.00" value={form.entry_price}
                  onChange={e => set('entry_price', e.target.value)} required
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-500 uppercase tracking-wide">Close Price</Label>
                <Input type="number" step="any" placeholder="0.00" value={form.close_price}
                  onChange={e => set('close_price', e.target.value)} required
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm" />
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <Label className="text-xs text-zinc-500 uppercase tracking-wide">Points</Label>
                <div className={cn(
                  'h-9 flex items-center px-3 rounded-md border text-sm font-bold tabular-nums',
                  points > 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                  points < 0 ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                  'bg-zinc-800 border-zinc-700 text-zinc-600'
                )}>
                  {points !== 0 ? (points > 0 ? '+' : '') + points.toFixed(2) : '—'}
                </div>
              </div>
            </div>

            {/* === SECTION 3: P/L === */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-500 uppercase tracking-wide">Size (lot)</Label>
                <Input type="number" step="any" placeholder="1" value={form.size}
                  onChange={e => set('size', e.target.value)} required
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-500 uppercase tracking-wide">Gross P/L ($)</Label>
                <Input type="number" step="any" placeholder="0.00" value={form.value}
                  onChange={e => set('value', e.target.value)} required
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm" />
                {points < 0 && grossAbs > 0 && (
                  <p className="text-[10px] text-zinc-500">Otomatis jadi −{grossAbs.toFixed(2)} (loss)</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-500 uppercase tracking-wide">Fee ($)</Label>
                <Input type="number" step="any" placeholder="0.00" value={form.fee}
                  onChange={e => set('fee', e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm" />
              </div>
            </div>

            {/* Net P/L result card */}
            {hasResult && (
              <div className={cn(
                'flex items-center justify-between rounded-lg border px-4 py-3',
                isWin ? 'bg-emerald-500/10 border-emerald-500/30' :
                isLoss ? 'bg-red-500/10 border-red-500/30' :
                'bg-zinc-800 border-zinc-700'
              )}>
                <div className="flex items-center gap-2">
                  <DollarSign className={cn('h-4 w-4', isWin ? 'text-emerald-400' : isLoss ? 'text-red-400' : 'text-zinc-500')} />
                  <span className="text-xs text-zinc-400 font-medium">Net P/L</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('text-lg font-bold tabular-nums',
                    isWin ? 'text-emerald-400' : isLoss ? 'text-red-400' : 'text-zinc-400'
                  )}>
                    {isWin ? '+' : ''}{formatCurrency(net)}
                  </span>
                  <span className={cn(
                    'text-xs font-bold px-2 py-0.5 rounded-full',
                    isWin ? 'bg-emerald-500/20 text-emerald-400' :
                    isLoss ? 'bg-red-500/20 text-red-400' :
                    'bg-zinc-700 text-zinc-400'
                  )}>
                    {isWin ? 'WIN' : isLoss ? 'LOSS' : 'BE'}
                  </span>
                </div>
              </div>
            )}

            <Separator className="bg-zinc-800" />

            {/* === SECTION 4: Psikologi === */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Psikologi & Disiplin</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-500">Emotion Score (1–10)</Label>
                  <Select value={form.emotion_score} onValueChange={v => v && set('emotion_score', v)}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm">
                      <SelectValue placeholder="Pilih score..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {[
                        { v: '1', label: '1 – Sangat Panik 😰' },
                        { v: '2', label: '2 – Panik 😰' },
                        { v: '3', label: '3 – Cemas 😟' },
                        { v: '4', label: '4 – Kurang Tenang 😐' },
                        { v: '5', label: '5 – Netral 😐' },
                        { v: '6', label: '6 – Cukup Fokus 🙂' },
                        { v: '7', label: '7 – Fokus 😊' },
                        { v: '8', label: '8 – Sangat Fokus 😎' },
                        { v: '9', label: '9 – In the Zone 🔥' },
                        { v: '10', label: '10 – Peak State 🔥' },
                      ].map(({ v, label }) => (
                        <SelectItem key={v} value={v} className="text-zinc-100 focus:bg-zinc-700 text-sm">{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-500">Ikut Aturan Trading?</Label>
                  <Select value={form.rule_followed} onValueChange={v => v && set('rule_followed', v)}>
                    <SelectTrigger className={cn(
                      'h-9 text-sm border',
                      form.rule_followed === 'true' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                      form.rule_followed === 'false' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                      'bg-zinc-800 border-zinc-700 text-zinc-400'
                    )}>
                      <SelectValue placeholder="Pilih..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="true" className="text-emerald-400 focus:bg-zinc-700 text-sm">✅ Ya, ikut aturan</SelectItem>
                      <SelectItem value="false" className="text-red-400 focus:bg-zinc-700 text-sm">❌ Tidak, melanggar aturan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">Alasan Entry</Label>
              <Textarea placeholder="Setup apa yang kamu lihat? Confluences? Level penting?" value={form.reason_entry}
                onChange={e => set('reason_entry', e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 resize-none h-16 text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">Lesson / Catatan</Label>
              <Textarea placeholder="Apa yang bisa dipelajari dari trade ini?" value={form.lesson_notes}
                onChange={e => set('lesson_notes', e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 resize-none h-16 text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">Tags</Label>
              <TagsInput tags={tags} onChange={setTags} />
            </div>

          </form>
        </div>

        {/* Footer sticky */}
        <div className="px-6 py-3 border-t border-zinc-800 shrink-0 bg-zinc-900 space-y-3">
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              ⚠ {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => handleClose(false)}
            className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 h-9 text-sm">
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}
            className={cn('h-9 font-semibold gap-2 text-sm',
              hasResult && isWin ? 'bg-emerald-600 hover:bg-emerald-500' :
              hasResult && isLoss ? 'bg-red-700 hover:bg-red-600' :
              'bg-zinc-700 hover:bg-zinc-600'
            )}>
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {loading ? 'Menyimpan...' : 'Simpan Trade'}
          </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
