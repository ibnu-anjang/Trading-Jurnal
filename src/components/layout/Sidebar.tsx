'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, CalendarDays, ListOrdered, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/trades', label: 'All Trades', icon: ListOrdered },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 border-r border-zinc-800 bg-zinc-900 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-zinc-800">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
        </div>
        <span className="font-bold text-zinc-100 text-sm tracking-wide">Trading Journal</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Version */}
      <div className="px-6 py-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-600">v1.0.0</p>
      </div>
    </aside>
  )
}
