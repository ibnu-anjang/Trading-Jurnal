'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, CalendarDays, ListOrdered, Wallet, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/trades', label: 'Trades', icon: ListOrdered },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/accounts', label: 'Akun', icon: Wallet },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/80">
      <div className="grid grid-cols-5 h-14">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                active ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-200'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
