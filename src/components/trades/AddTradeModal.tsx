'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Loader2 } from 'lucide-react'
import { TradeInsert } from '@/types/trade'

interface Props {
  onAdd: (trade: TradeInsert) => Promise<{ error: string | null }>
}

const SYMBOLS = ['NQ', 'ES', 'YM', 'RTY', 'CL', 'GC', 'EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD']

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

export default function AddTradeModal({ onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const net = (parseFloat(form.value) || 0) - (parseFloat(form.fee) || 0)
  const points = (parseFloat(form.close_price) || 0) - (parseFloat(form.entry_price) || 0)

  function set(key: keyof typeof defaultForm, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.direction || !form.symbol) {
      setError('Symbol dan Direction wajib diisi')
      return
    }
    setLoading(true)
    setError(null)

    const payload: TradeInsert = {
      trade_date: new Date(form.trade_date).toISOString(),
      symbol: form.symbol.toUpperCase(),
      direction: form.direction as 'Long' | 'Short',
      entry_price: parseFloat(form.entry_price),
      close_price: parseFloat(form.close_price),
      size: parseFloat(form.size),
      value: parseFloat(form.value),
      fee: parseFloat(form.fee) || 0,
      reason_entry: form.reason_entry || null,
      emotion_score: form.emotion_score ? parseInt(form.emotion_score) : null,
      rule_followed: form.rule_followed !== '' ? form.rule_followed === 'true' : null,
      lesson_notes: form.lesson_notes || null,
    }

    const { error } = await onAdd(payload)
    if (error) {
      setError(error)
    } else {
      setForm(defaultForm)
      setOpen(false)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 transition-colors">
        <Plus className="h-4 w-4" />
        Tambah Trade
      </DialogTrigger>

      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Tambah Trade Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Baris 1: Tanggal + Symbol + Direction */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Tanggal & Waktu</Label>
              <Input
                type="datetime-local"
                value={form.trade_date}
                onChange={e => set('trade_date', e.target.value)}
                required
                className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Symbol</Label>
              <Select value={form.symbol} onValueChange={v => v && set('symbol', v)}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue placeholder="Pilih..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {SYMBOLS.map(s => (
                    <SelectItem key={s} value={s} className="text-zinc-100 focus:bg-zinc-700">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Direction</Label>
              <Select value={form.direction} onValueChange={v => v && set('direction', v)}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue placeholder="Pilih..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="Long" className="text-emerald-400 focus:bg-zinc-700">Long</SelectItem>
                  <SelectItem value="Short" className="text-red-400 focus:bg-zinc-700">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Baris 2: Entry + Close + Points (preview) */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Entry Price</Label>
              <Input
                type="number" step="any"
                placeholder="0.00"
                value={form.entry_price}
                onChange={e => set('entry_price', e.target.value)}
                required
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Close Price</Label>
              <Input
                type="number" step="any"
                placeholder="0.00"
                value={form.close_price}
                onChange={e => set('close_price', e.target.value)}
                required
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Points (otomatis)</Label>
              <div className={`h-10 flex items-center px-3 rounded-md border text-sm font-medium ${points > 0 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : points < 0 ? 'border-red-500/30 bg-red-500/10 text-red-400' : 'border-zinc-700 bg-zinc-800 text-zinc-500'}`}>
                {points > 0 ? '+' : ''}{points.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Baris 3: Size + Value + Fee + Net preview */}
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Size (lot/kontrak)</Label>
              <Input
                type="number" step="any"
                placeholder="1"
                value={form.size}
                onChange={e => set('size', e.target.value)}
                required
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Gross P/L ($)</Label>
              <Input
                type="number" step="any"
                placeholder="0.00"
                value={form.value}
                onChange={e => set('value', e.target.value)}
                required
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Fee ($)</Label>
              <Input
                type="number" step="any"
                placeholder="0.00"
                value={form.fee}
                onChange={e => set('fee', e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Net P/L (otomatis)</Label>
              <div className={`h-10 flex items-center px-3 rounded-md border text-sm font-bold ${net > 0 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : net < 0 ? 'border-red-500/30 bg-red-500/10 text-red-400' : 'border-zinc-700 bg-zinc-800 text-zinc-500'}`}>
                {net > 0 ? '+' : ''}${net.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Baris 4: Emotion Score + Rule Followed */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Emotion Score (1–10)</Label>
              <Select value={form.emotion_score} onValueChange={v => v && set('emotion_score', v)}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue placeholder="Pilih score..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                    <SelectItem key={n} value={String(n)} className="text-zinc-100 focus:bg-zinc-700">
                      {n} {n <= 3 ? '😰' : n <= 6 ? '😐' : '😎'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Ikut Aturan? (Rule Followed)</Label>
              <Select value={form.rule_followed} onValueChange={v => v && set('rule_followed', v)}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue placeholder="Pilih..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="true" className="text-emerald-400 focus:bg-zinc-700">✅ Ya</SelectItem>
                  <SelectItem value="false" className="text-red-400 focus:bg-zinc-700">❌ Tidak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reason Entry */}
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs">Alasan Entry</Label>
            <Textarea
              placeholder="Kenapa kamu masuk di trade ini? (setup, confluences, dll)"
              value={form.reason_entry}
              onChange={e => set('reason_entry', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 resize-none h-20"
            />
          </div>

          {/* Lesson Notes */}
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs">Lesson / Catatan</Label>
            <Textarea
              placeholder="Apa yang bisa dipelajari dari trade ini?"
              value={form.lesson_notes}
              onChange={e => set('lesson_notes', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 resize-none h-20"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {/* Preview badge W/L */}
          {form.value && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              Hasil trade ini:{' '}
              <Badge className={net > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : net < 0 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}>
                {net > 0 ? 'Win' : net < 0 ? 'Loss' : 'Breakeven'}
              </Badge>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? 'Menyimpan...' : 'Simpan Trade'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
