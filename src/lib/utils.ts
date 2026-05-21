import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM yyyy', { locale: id })
}

export function formatDateTime(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM yyyy HH:mm', { locale: id })
}

export function getPnLColor(value: number): string {
  if (value > 0) return 'text-emerald-400'
  if (value < 0) return 'text-red-400'
  return 'text-zinc-400'
}

export function getPnLBg(value: number): string {
  if (value > 0) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  if (value < 0) return 'bg-red-500/10 text-red-400 border-red-500/20'
  return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
}
