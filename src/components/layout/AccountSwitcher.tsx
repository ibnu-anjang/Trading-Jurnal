'use client'

import Link from 'next/link'
import { useActiveAccount } from '@/contexts/ActiveAccountContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Check, ChevronsUpDown, Plus, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function AccountSwitcher() {
  const { accounts, activeAccount, setActiveAccount } = useActiveAccount()

  if (accounts.length === 0) {
    return (
      <Link
        href="/accounts/new"
        className="flex items-center gap-2 px-2.5 h-9 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800/80 text-xs text-emerald-400"
      >
        <Plus className="h-3.5 w-3.5" />
        Buat akun
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-2.5 h-9 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800/80 transition-colors outline-none min-w-0 max-w-[220px]">
        <Wallet className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
        <div className="flex flex-col items-start min-w-0">
          <span className="text-xs font-medium text-zinc-100 truncate max-w-[140px]">
            {activeAccount?.name ?? 'Pilih akun'}
          </span>
          {activeAccount && (
            <span className="text-[10px] text-zinc-500 leading-none">
              {activeAccount.currency}
            </span>
          )}
        </div>
        <ChevronsUpDown className="h-3 w-3 text-zinc-500 shrink-0 ml-auto" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64 bg-zinc-900 border-zinc-800">
        <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-zinc-500">
          Akun Trading
        </div>
        <DropdownMenuSeparator className="bg-zinc-800" />
        {accounts.map(acc => (
          <DropdownMenuItem
            key={acc.id}
            onClick={() => setActiveAccount(acc.id)}
            className="flex items-start gap-2 text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{acc.name}</p>
              <p className="text-[10px] text-zinc-500">
                {acc.broker ? `${acc.broker} • ` : ''}
                {acc.currency} • {formatCurrency(acc.initial_balance)}
              </p>
            </div>
            {activeAccount?.id === acc.id && (
              <Check className="h-3.5 w-3.5 text-emerald-400 mt-1 shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem className="text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-300 cursor-pointer p-0">
          <Link href="/accounts" className="flex items-center gap-2 w-full px-2 py-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span className="text-sm">Kelola akun</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
