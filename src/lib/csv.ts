import type { Trade } from '@/types/trade'

const HEADERS = [
  'Date', 'Symbol', 'Direction', 'Entry', 'Close', 'Points', 'Size',
  'Gross Value', 'Fee', 'Net', 'W/L',
  'Reason Entry', 'Emotion Score', 'Rule Followed', 'Lesson Notes',
  'Tags', 'Screenshot Count',
]

function escapeCSV(v: unknown): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  // Quote kalau ada koma, quote, atau newline. Escape quote dengan double-quote.
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function tradesToCSV(trades: Trade[]): string {
  const rows = trades.map(t => [
    t.trade_date,
    t.symbol,
    t.direction,
    t.entry_price,
    t.close_price,
    t.points,
    t.size,
    t.value,
    t.fee,
    t.net,
    t.win_loss,
    t.reason_entry ?? '',
    t.emotion_score ?? '',
    t.rule_followed === null ? '' : t.rule_followed ? 'Yes' : 'No',
    t.lesson_notes ?? '',
    (t.tags ?? []).join('; '),
    (t.screenshots ?? []).length,
  ].map(escapeCSV).join(','))

  return [HEADERS.join(','), ...rows].join('\n')
}

export function downloadCSV(filename: string, csv: string) {
  // BOM biar Excel baca utf-8 dengan benar
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
