import Link from 'next/link'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
          <Compass className="h-6 w-6 text-zinc-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">404</h1>
          <p className="text-sm text-zinc-400 mt-1">Halaman tidak ditemukan</p>
          <p className="text-xs text-zinc-500 mt-2">
            URL yang kamu tuju tidak ada atau sudah dipindah.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
