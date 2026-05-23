import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveAccount } from '@/lib/active-account'
import { ActiveAccountProvider } from '@/contexts/ActiveAccountContext'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { account, accounts } = await getActiveAccount()

  return (
    <ActiveAccountProvider
      initialAccounts={accounts}
      initialActiveId={account?.id ?? null}
    >
      <div className="flex h-screen bg-zinc-950">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header userEmail={user.email} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6 bg-zinc-950">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </ActiveAccountProvider>
  )
}
