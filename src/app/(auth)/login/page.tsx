'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [show, setShow] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
          </div>
          <span className="text-xl font-bold text-zinc-100">Trading Journal</span>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-zinc-100">Masuk ke akun</CardTitle>
            <CardDescription className="text-zinc-400">
              Masukkan email dan password kamu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="kamu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-zinc-300">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300">
                    Lupa password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={show ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    tabIndex={-1}
                    aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loading ? 'Masuk...' : 'Masuk'}
              </Button>
            </form>

            <p className="text-center text-sm text-zinc-500 mt-4">
              Belum punya akun?{' '}
              <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Daftar sekarang
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
