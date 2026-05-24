'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/logger'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    logger.error('app.error-boundary', error, { digest: error.digest })
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-red-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-100">Terjadi kesalahan</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Sesuatu tidak berjalan semestinya. Coba lagi atau muat ulang halaman.
          </p>
        </div>
        {error.digest && (
          <p className="text-[10px] text-zinc-600 font-mono">ID: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            onClick={() => unstable_retry()}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
          >
            <RotateCw className="h-3.5 w-3.5" /> Coba lagi
          </Button>
          <Button
            onClick={() => window.location.reload()}
            size="sm"
            variant="outline"
            className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
          >
            Muat ulang
          </Button>
        </div>
      </div>
    </div>
  )
}
