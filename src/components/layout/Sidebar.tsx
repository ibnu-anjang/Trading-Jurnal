'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, CalendarDays, ListOrdered, TrendingUp, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/trades', label: 'All Trades', icon: ListOrdered },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-900 flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-800">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        </div>
        <span className="font-bold text-zinc-100 text-sm tracking-wide">Trading Journal</span>
      </div>

      {/* Nav utama */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        <p className="px-3 pt-1 pb-2 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Menu</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 border border-transparent'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Settings di bawah */}
      <div className="px-3 py-3 border-t border-zinc-800 space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
            pathname === '/settings'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 border border-transparent'
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Settings
        </Link>
        <p className="px-3 pt-1 text-[10px] text-zinc-700">v1.0.0</p>
      </div>
    </aside>
  )
}
