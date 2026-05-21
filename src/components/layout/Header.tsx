'use client'

import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Settings } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/trades': 'All Trades',
  '/calendar': 'Calendar View',
  '/settings': 'Settings',
}

interface HeaderProps {
  userEmail?: string
}

export default function Header({ userEmail }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const title = PAGE_TITLES[pathname] ?? 'Trading Journal'
  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'TJ'

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-900 px-6 flex items-center justify-between shrink-0">
      <h1 className="text-sm font-semibold text-zinc-100">{title}</h1>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2.5 hover:opacity-80 transition-opacity outline-none">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-zinc-300 leading-tight truncate max-w-[160px]">{userEmail}</p>
            <p className="text-[10px] text-zinc-500">Trader</p>
          </div>
          <Avatar className="h-7 w-7 border border-zinc-700">
            <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 bg-zinc-900 border-zinc-800">
          <DropdownMenuItem
            onClick={() => router.push('/settings')}
            className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer text-sm"
          >
            <Settings className="h-3.5 w-3.5 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer text-sm"
          >
            <LogOut className="h-3.5 w-3.5 mr-2" />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
