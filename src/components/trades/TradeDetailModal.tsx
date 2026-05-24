'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Pencil, Trash2, Loader2, X, Save, TrendingUp, TrendingDown, DollarSign, Brain, Calendar, Tag as TagIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatCurrency, formatDateTime } from '@/lib/utils'
import { Trade, TradeInsert } from '@/types/trade'
import TagsInput from './TagsInput'
import ScreenshotUploader from './ScreenshotUploader'
import { createClient } from '@/lib/supabase/client'
import { Image as ImageIcon } from 'lucide-react'

interface Props {
  trade: Trade | null
  open: boolean
  onClose: () => void
  onUpdate: (id: string, payload: TradeInsert) => Promise<{ error: string | null }>
  onUpdateScreenshots?: (id: string, screenshots: string[]) => Promise<{ error: string | null }>
  onDelete: (id: string) => Promise<{ error: string | null }>
  symbols?: string[]
}

const DEFAULT_SYMBOLS = ['NQ', 'ES', 'YM', 'RTY', 'CL', 'GC', 'EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD']

function tradeToForm(t: Trade) {
  return {
    trade_date: new Date(t.trade_date).toISOString().slice(0, 16),
    symbol: t.symbol,
    direction: t.direction as 'Long' | 'Short',
    entry_price: String(t.entry_price),
    close_price: String(t.close_price),
    size: String(t.size),
    value: String(Math.abs(t.value)),
    fee: String(t.fee ?? 0),
    reason_entry: t.reason_entry ?? '',
    emotion_score: t.emotion_score != null ? String(t.emotion_score) : '',
    rule_followed: t.rule_followed == null ? '' : (t.rule_followed ? 'true' : 'false') as 'true' | 'false' | '',
    lesson_notes: t.lesson_notes ?? '',
    tags: t.tags ?? [],
  }
}

export default function TradeDetailModal({ trade, open, onClose, onUpdate, onUpdateScreenshots, onDelete, symbols = DEFAULT_SYMBOLS }: Props) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(trade ? tradeToForm(trade) : null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    if (trade) setForm(tradeToForm(trade))
    setEditing(false)
    setError(null)
  }, [trade])

  useEffect(() => {
    if (!open || userId) return
    const supabase = createClient()
    supabase.auth.getUser().then((res: { data: { user: { id: string } | null } }) => {
      if (res.data.user) setUserId(res.data.user.id)
    })
  }, [open, userId])

  if (!trade || !form) return null

  function set(key: keyof Omit<NonNullable<typeof form>, 'tags'>, val: string) {
    setForm(prev => prev ? { ...prev, [key]: val } : prev)
  }

  function setTags(tags: string[]) {
    setForm(prev => prev ? { ...prev, tags } : prev)
  }

  const rawDiff = (parseFloat(form.close_price) || 0) - (parseFloat(form.entry_price) || 0)
  const points = form.direction === 'Short' ? -rawDiff : rawDiff
  const grossAbs = Math.abs(parseFloat(form.value) || 0)
  const gross = points < 0 ? -grossAbs : grossAbs
  const fee = parseFloat(form.fee) || 0
  const net = gross - fee

  async function handleSave() {
    if (!form) return
    const missing: string[] = []
    if (!form.symbol) missing.push('Symbol')
    if (!form.direction) missing.push('Direction')
    if (!form.entry_price) missing.push('Entry Price')
    if (!form.close_price) missing.push('Close Price')
    if (!form.size) missing.push('Size')
    if (form.value === '') missing.push('Gross P/L')
    if (missing.length > 0) { setError(`Field wajib belum diisi: ${missing.join(', ')}`); return }
    setBusy(true); setError(null)
    const { error: err } = await onUpdate(trade!.id, {
      trade_date: new Date(form.trade_date).toISOString(),
      symbol: form.symbol.toUpperCase(),
      direction: form.direction as 'Long' | 'Short',
      entry_price: parseFloat(form.entry_price),
      close_price: parseFloat(form.close_price),
      size: parseFloat(form.size),
      value: gross,
      fee,
      reason_entry: form.reason_entry || null,
      emotion_score: form.emotion_score ? parseInt(form.emotion_score) : null,
      rule_followed: form.rule_followed !== '' ? form.rule_followed === 'true' : null,
      lesson_notes: form.lesson_notes || null,
      tags: form.tags,
    })
    if (err) { setError(err); toast.error('Gagal update trade', { description: err }); setBusy(false); return }
    setEditing(false)
    setBusy(false)
    toast.success('Trade berhasil diupdate')
  }

  async function handleDelete() {
    if (!confirm('Hapus trade ini? Aksi ini tidak bisa di-undo.')) return
    setBusy(true)
    const { error: err } = await onDelete(trade!.id)
    setBusy(false)
    if (err) { setError(err); toast.error('Gagal hapus trade', { description: err }); return }
    onClose()
    toast.success('Trade dihapus')
  }

  function handleCancel() {
    if (trade) setForm(tradeToForm(trade))
    setEditing(false)
    setError(null)
  }

  const isWin = trade.win_loss === 'Win'
  const isLoss = trade.win_loss === 'Loss'

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 p-0 gap-0 overflow-hidden flex flex-col
        max-sm:!max-w-none max-sm:!w-screen max-sm:!h-[100dvh] max-sm:!max-h-[100dvh] max-sm:!rounded-none max-sm:!top-0 max-sm:!left-0 max-sm:!translate-x-0 max-sm:!translate-y-0
        sm:max-w-xl sm:max-h-[90vh]">

        {/* Color strip */}
        <div className={cn('h-1 w-full shrink-0',
          isWin ? 'bg-emerald-500' : isLoss ? 'bg-red-500' : 'bg-zinc-600')} />

        {/* Header */}
        <div className="px-6 pt-5 pb-3 shrink-0 border-b border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 text-sm font-semibold flex items-center gap-2">
              {editing ? <Pencil className="h-3.5 w-3.5 text-amber-400" /> : <Calendar className="h-3.5 w-3.5 text-emerald-400" />}
              {editing ? 'Edit Trade' : 'Detail Trade'}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {editing ? (
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave() }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                  <Label className="text-xs text-zinc-500 uppercase tracking-wide">Tanggal & Waktu</Label>
                  <Input type="datetime-local" value={form.trade_date} onChange={e => set('trade_date', e.target.value)} required className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-500 uppercase tracking-wide">Symbol</Label>
                  <Select value={form.symbol} onValueChange={v => v && set('symbol', v)}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {symbols.map(s => <SelectItem key={s} value={s} className="text-zinc-100 focus:bg-zinc-700 text-sm">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-500 uppercase tracking-wide">Direction</Label>
                  <Select value={form.direction} onValueChange={v => v && set('direction', v)}>
                    <SelectTrigger className={cn('h-9 text-sm border font-semibold',
                      form.direction === 'Long' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' :
                      'bg-red-500/10 border-red-500/40 text-red-400')}>
                      <SelectValue />
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

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-500 uppercase tracking-wide">Entry</Label>
                  <Input type="number" step="any" value={form.entry_price} onChange={e => set('entry_price', e.target.value)} required className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-500 uppercase tracking-wide">Close</Label>
                  <Input type="number" step="any" value={form.close_price} onChange={e => set('close_price', e.target.value)} required className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm" />
                </div>
                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                  <Label className="text-xs text-zinc-500 uppercase tracking-wide">Points</Label>
                  <div className={cn('h-9 flex items-center px-3 rounded-md border text-sm font-bold tabular-nums',
                    points > 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                    points < 0 ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                    'bg-zinc-800 border-zinc-700 text-zinc-600')}>
                    {points !== 0 ? (points > 0 ? '+' : '') + points.toFixed(2) : '—'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-500 uppercase tracking-wide">Size</Label>
                  <Input type="number" step="any" value={form.size} onChange={e => set('size', e.target.value)} required className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-500 uppercase tracking-wide">Gross P/L</Label>
                  <Input type="number" step="any" value={form.value} onChange={e => set('value', e.target.value)} required className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm" />
                  {points < 0 && grossAbs > 0 && (
                    <p className="text-[10px] text-zinc-500">Otomatis jadi −{grossAbs.toFixed(2)} (loss)</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-500 uppercase tracking-wide">Fee</Label>
                  <Input type="number" step="any" value={form.fee} onChange={e => set('fee', e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm" />
                </div>
              </div>

              {/* Net P/L preview */}
              <div className={cn('flex items-center justify-between rounded-lg border px-4 py-3',
                net > 0 ? 'bg-emerald-500/10 border-emerald-500/30' :
                net < 0 ? 'bg-red-500/10 border-red-500/30' :
                'bg-zinc-800 border-zinc-700')}>
                <div className="flex items-center gap-2">
                  <DollarSign className={cn('h-4 w-4', net > 0 ? 'text-emerald-400' : net < 0 ? 'text-red-400' : 'text-zinc-500')} />
                  <span className="text-xs text-zinc-400 font-medium">Net P/L</span>
                </div>
                <span className={cn('text-lg font-bold tabular-nums',
                  net > 0 ? 'text-emerald-400' : net < 0 ? 'text-red-400' : 'text-zinc-400')}>
                  {net > 0 ? '+' : ''}{formatCurrency(net)}
                </span>
              </div>

              <Separator className="bg-zinc-800" />

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Psikologi & Disiplin</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-500">Emotion Score</Label>
                    <Select value={form.emotion_score} onValueChange={v => v && set('emotion_score', v)}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 h-9 text-sm"><SelectValue placeholder="Pilih score..." /></SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        {Array.from({ length: 10 }, (_, i) => String(i + 1)).map(v => (
                          <SelectItem key={v} value={v} className="text-zinc-100 focus:bg-zinc-700 text-sm">{v}/10</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-500">Ikut Aturan?</Label>
                    <Select value={form.rule_followed} onValueChange={v => v && set('rule_followed', v)}>
                      <SelectTrigger className={cn('h-9 text-sm border',
                        form.rule_followed === 'true' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                        form.rule_followed === 'false' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                        'bg-zinc-800 border-zinc-700 text-zinc-400')}>
                        <SelectValue placeholder="Pilih..." />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="true" className="text-emerald-400 focus:bg-zinc-700 text-sm">✅ Ya, ikut aturan</SelectItem>
                        <SelectItem value="false" className="text-red-400 focus:bg-zinc-700 text-sm">❌ Tidak, melanggar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-500">Alasan Entry</Label>
                <Textarea value={form.reason_entry} onChange={e => set('reason_entry', e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 resize-none h-16 text-sm" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-500">Lesson / Catatan</Label>
                <Textarea value={form.lesson_notes} onChange={e => set('lesson_notes', e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 resize-none h-16 text-sm" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-500">Tags</Label>
                <TagsInput tags={form.tags} onChange={setTags} />
              </div>

              {userId && onUpdateScreenshots && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <ImageIcon className="h-3 w-3" /> Screenshots
                  </Label>
                  <ScreenshotUploader
                    tradeId={trade.id}
                    userId={userId}
                    screenshots={trade.screenshots ?? []}
                    onChange={async (paths) => { await onUpdateScreenshots(trade.id, paths) }}
                  />
                </div>
              )}

            </form>
          ) : (
            /* === VIEW MODE === */
            <div className="space-y-4">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-bold text-zinc-100">{trade.symbol}</span>
                  <Badge className={trade.direction === 'Long'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'}>
                    {trade.direction === 'Long' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {trade.direction}
                  </Badge>
                  <Badge className={
                    isWin ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    isLoss ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                    'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'}>
                    {trade.win_loss}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500">{formatDateTime(trade.trade_date)}</p>
              </div>

              {/* Big Net P/L */}
              <div className={cn('rounded-lg border px-4 py-3 flex items-center justify-between',
                isWin ? 'bg-emerald-500/10 border-emerald-500/30' :
                isLoss ? 'bg-red-500/10 border-red-500/30' :
                'bg-zinc-800 border-zinc-700')}>
                <span className="text-xs text-zinc-400 font-medium">Net P/L</span>
                <span className={cn('text-2xl font-bold tabular-nums',
                  isWin ? 'text-emerald-400' : isLoss ? 'text-red-400' : 'text-zinc-400')}>
                  {(trade.net ?? 0) >= 0 ? '+' : ''}{formatCurrency(trade.net ?? 0)}
                </span>
              </div>

              {/* Prices grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat label="Entry" value={String(trade.entry_price)} />
                <Stat label="Close" value={String(trade.close_price)} />
                <Stat label="Points" value={`${(trade.points ?? 0) > 0 ? '+' : ''}${(trade.points ?? 0).toFixed(2)}`}
                  color={(trade.points ?? 0) > 0 ? 'text-emerald-400' : (trade.points ?? 0) < 0 ? 'text-red-400' : undefined} />
                <Stat label="Size" value={String(trade.size)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Stat label="Gross P/L" value={formatCurrency(trade.value ?? 0)}
                  color={(trade.value ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'} />
                <Stat label="Fee" value={formatCurrency(trade.fee ?? 0)} />
              </div>

              <Separator className="bg-zinc-800" />

              {/* Psikologi */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Psikologi & Disiplin</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Stat label="Emotion Score"
                    value={trade.emotion_score != null
                      ? `${trade.emotion_score}/10 ${trade.emotion_score <= 3 ? '😰' : trade.emotion_score <= 6 ? '😐' : '😎'}`
                      : '—'} />
                  <Stat label="Ikut Aturan"
                    value={trade.rule_followed == null ? '—' : trade.rule_followed ? '✅ Ya' : '❌ Tidak'}
                    color={trade.rule_followed == null ? undefined : trade.rule_followed ? 'text-emerald-400' : 'text-red-400'} />
                </div>
              </div>

              {(trade.reason_entry || trade.lesson_notes) && <Separator className="bg-zinc-800" />}

              {trade.reason_entry && (
                <div className="space-y-1.5">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Alasan Entry</p>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap bg-zinc-800/40 border border-zinc-800 rounded-lg p-3">{trade.reason_entry}</p>
                </div>
              )}

              {trade.lesson_notes && (
                <div className="space-y-1.5">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Lesson / Catatan</p>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap bg-zinc-800/40 border border-zinc-800 rounded-lg p-3">{trade.lesson_notes}</p>
                </div>
              )}

              {userId && onUpdateScreenshots && (
                <>
                  <Separator className="bg-zinc-800" />
                  <div className="space-y-1.5">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
                      <ImageIcon className="h-3 w-3" /> Screenshots {trade.screenshots?.length ? `(${trade.screenshots.length})` : ''}
                    </p>
                    <ScreenshotUploader
                      tradeId={trade.id}
                      userId={userId}
                      screenshots={trade.screenshots ?? []}
                      onChange={async (paths) => { await onUpdateScreenshots(trade.id, paths) }}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 shrink-0 bg-zinc-900 space-y-3">
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              ⚠ {error}
            </p>
          )}
          <div className="flex justify-between gap-2">
          {editing ? (
            <>
              <Button type="button" variant="ghost" onClick={handleCancel} disabled={busy} className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 h-9 text-sm gap-1.5">
                <X className="h-3.5 w-3.5" /> Batal
              </Button>
              <Button onClick={handleSave} disabled={busy} className="bg-emerald-600 hover:bg-emerald-500 h-9 text-sm gap-1.5 font-semibold">
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {busy ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={handleDelete} disabled={busy}
                className="border-zinc-700 bg-zinc-800 text-red-400 hover:bg-red-500/10 h-9 text-sm gap-1.5">
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Hapus
              </Button>
              <Button onClick={() => setEditing(true)} className="bg-emerald-600 hover:bg-emerald-500 h-9 text-sm gap-1.5 font-semibold">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            </>
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={cn('text-sm font-semibold tabular-nums', color ?? 'text-zinc-200')}>{value}</p>
    </div>
  )
}
