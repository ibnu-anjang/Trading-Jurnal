'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Calendar } from 'lucide-react'

export type RangePreset = '7d' | '30d' | '90d' | 'mtd' | 'ytd' | 'all' | 'custom'

export interface DateRange {
  preset: RangePreset
  /** ISO date YYYY-MM-DD (inclusive). null = no lower bound */
  from: string | null
  /** ISO date YYYY-MM-DD (inclusive). null = no upper bound */
  to: string | null
}

const PRESETS: { key: Exclude<RangePreset, 'custom'>; label: string }[] = [
  { key: '7d', label: '7H' },
  { key: '30d', label: '30H' },
  { key: '90d', label: '90H' },
  { key: 'mtd', label: 'MTD' },
  { key: 'ytd', label: 'YTD' },
  { key: 'all', label: 'All' },
]

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function computeRange(preset: Exclude<RangePreset, 'custom'>): DateRange {
  const now = new Date()
  const today = toISODate(now)

  if (preset === 'all') return { preset, from: null, to: null }
  if (preset === 'mtd') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return { preset, from: toISODate(start), to: today }
  }
  if (preset === 'ytd') {
    const start = new Date(now.getFullYear(), 0, 1)
    return { preset, from: toISODate(start), to: today }
  }
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90
  const start = new Date(now)
  start.setDate(start.getDate() - (days - 1))
  return { preset, from: toISODate(start), to: today }
}

interface Props {
  value: DateRange
  onChange: (r: DateRange) => void
}

export default function DateRangeFilter({ value, onChange }: Props) {
  const [customOpen, setCustomOpen] = useState(false)
  const [draftFrom, setDraftFrom] = useState(value.from ?? '')
  const [draftTo, setDraftTo] = useState(value.to ?? '')

  function pickPreset(k: Exclude<RangePreset, 'custom'>) {
    onChange(computeRange(k))
  }

  function openCustom() {
    setDraftFrom(value.from ?? '')
    setDraftTo(value.to ?? '')
    setCustomOpen(true)
  }

  function applyCustom() {
    if (!draftFrom || !draftTo) return
    if (draftFrom > draftTo) return
    onChange({ preset: 'custom', from: draftFrom, to: draftTo })
    setCustomOpen(false)
  }

  return (
    <>
      <div className="flex items-center gap-1 flex-wrap">
        {PRESETS.map(p => {
          const active = value.preset === p.key
          return (
            <Button
              key={p.key}
              variant="ghost"
              size="sm"
              onClick={() => pickPreset(p.key)}
              className={`h-7 px-2.5 text-xs ${
                active
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}
            >
              {p.label}
            </Button>
          )
        })}
        <Button
          variant="ghost"
          size="sm"
          onClick={openCustom}
          className={`h-7 px-2.5 text-xs flex items-center gap-1 ${
            value.preset === 'custom'
              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
          }`}
        >
          <Calendar className="h-3 w-3" />
          {value.preset === 'custom' && value.from && value.to
            ? `${value.from.slice(5)} → ${value.to.slice(5)}`
            : 'Custom'}
        </Button>
      </div>

      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Pilih Rentang Tanggal</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">Dari</Label>
              <Input
                type="date"
                value={draftFrom}
                onChange={e => setDraftFrom(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">Sampai</Label>
              <Input
                type="date"
                value={draftTo}
                onChange={e => setDraftTo(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            {draftFrom && draftTo && draftFrom > draftTo && (
              <p className="text-xs text-red-400">Tanggal &quot;Dari&quot; harus sebelum &quot;Sampai&quot;.</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setCustomOpen(false)} className="text-zinc-400 h-8">
                Batal
              </Button>
              <Button
                size="sm"
                onClick={applyCustom}
                disabled={!draftFrom || !draftTo || draftFrom > draftTo}
                className="bg-emerald-600 hover:bg-emerald-500 h-8"
              >
                Terapkan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
