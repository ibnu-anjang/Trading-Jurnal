'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { type EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Loader2, Eye, EyeOff } from 'lucide-react'

const INVALID_LINK = 'Link reset tidak valid atau sudah kedaluwarsa. Minta link baru dari halaman Lupa Password.'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [show, setShow] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }
    if (password !== confirm) {
      setError('Konfirmasi password tidak cocok.')
      return
    }

    const tokenHash = searchParams.get('token_hash')
    const otpType = searchParams.get('type') as EmailOtpType | null
    const code = searchParams.get('code')
    if ((!tokenHash || !otpType) && !code) {
      setError(INVALID_LINK)
      return
    }

    setLoading(true)

    const { error: verifyError } = tokenHash && otpType
      ? await supabase.auth.verifyOtp({ type: otpType, token_hash: tokenHash })
      : await supabase.auth.exchangeCodeForSession(code!)
    if (verifyError) {
      setError(INVALID_LINK)
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl text-zinc-100">Password baru</CardTitle>
        <CardDescription className="text-zinc-400">
          Masukkan password baru untuk akun kamu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">Password baru</Label>
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
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-zinc-300">Konfirmasi password</Label>
            <div className="relative">
              <Input
                id="confirm"
                type={show ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
            {loading ? 'Menyimpan...' : 'Simpan password baru'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
          </div>
          <span className="text-xl font-bold text-zinc-100">Trading Journal</span>
        </div>
        <Suspense fallback={<div className="text-center text-zinc-500 text-sm">Memuat...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
