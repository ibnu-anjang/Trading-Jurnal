'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    logger.error('app.global-error', error, { digest: error.digest })
  }, [error])

  return (
    <html lang="id" className="dark">
      <body style={{
        margin: 0,
        minHeight: '100vh',
        background: '#09090b',
        color: '#fafafa',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
        <div style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            margin: '0 auto 16px',
            borderRadius: '9999px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
          }}>
            ⚠️
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px' }}>
            Aplikasi mengalami error fatal
          </h1>
          <p style={{ fontSize: '14px', color: '#71717a', margin: '0 0 16px' }}>
            Sesuatu tidak berjalan semestinya pada level root. Coba muat ulang halaman.
          </p>
          {error.digest && (
            <p style={{ fontSize: '11px', color: '#52525b', fontFamily: 'monospace', margin: '0 0 16px' }}>
              ID: {error.digest}
            </p>
          )}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              onClick={() => unstable_retry()}
              style={{
                background: '#059669',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Coba lagi
            </button>
            <button
              onClick={() => window.location.assign('/')}
              style={{
                background: '#18181b',
                color: '#d4d4d8',
                border: '1px solid #3f3f46',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Ke beranda
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
