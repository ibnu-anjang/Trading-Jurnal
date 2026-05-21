'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Settings, User } from 'lucide-react'

interface HeaderProps {
  userEmail?: string
  title: string
}

export default function Header({ userEmail, title }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const initials = userEmail
    ? userEmail.slice(0, 2).toUpperCase()
    : 'TJ'

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-900 px-6 flex items-center justify-between shrink-0">
      <h1 className="text-lg font-semibold text-zinc-100">{title}</h1>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2.5 hover:opacity-80 transition-opacity outline-none">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-zinc-300 leading-tight">{userEmail}</p>
            <p className="text-xs text-zinc-500">Trader</p>
          </div>
          <Avatar className="h-8 w-8 border border-zinc-700">
            <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800">
          <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer">
            <User className="h-4 w-4 mr-2" />
            Profil
          </DropdownMenuItem>
          <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer">
            <Settings className="h-4 w-4 mr-2" />
            Pengaturan
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
