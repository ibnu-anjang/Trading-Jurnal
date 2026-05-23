'use client'

import { createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import type { TradingAccount } from '@/types/account'

const ACTIVE_ACCOUNT_COOKIE = 'active_account_id'

interface Ctx {
  accounts: TradingAccount[]
  activeAccount: TradingAccount | null
  setActiveAccount: (id: string) => void
}

const ActiveAccountContext = createContext<Ctx | null>(null)

function writeCookie(id: string) {
  document.cookie = `${ACTIVE_ACCOUNT_COOKIE}=${id}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
}

interface ProviderProps {
  initialAccounts: TradingAccount[]
  initialActiveId: string | null
  children: React.ReactNode
}

export function ActiveAccountProvider({
  initialAccounts,
  initialActiveId,
  children,
}: ProviderProps) {
  const router = useRouter()

  // Server adalah satu-satunya source-of-truth untuk activeId (via cookie).
  // Setter cukup tulis cookie + router.refresh() agar server re-resolve.
  function setActiveAccount(id: string) {
    if (id === initialActiveId) return
    writeCookie(id)
    router.refresh()
  }

  const activeAccount = initialAccounts.find(a => a.id === initialActiveId) ?? null

  return (
    <ActiveAccountContext.Provider
      value={{ accounts: initialAccounts, activeAccount, setActiveAccount }}
    >
      {children}
    </ActiveAccountContext.Provider>
  )
}

export function useActiveAccount() {
  const ctx = useContext(ActiveAccountContext)
  if (!ctx) throw new Error('useActiveAccount harus dipakai di dalam ActiveAccountProvider')
  return ctx
}
