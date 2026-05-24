/**
 * Validasi environment variables di startup.
 * Throw saat module pertama kali di-import kalau ada env hilang/invalid.
 * Fail-fast > crash random di tengah jalan.
 */

function required(name: string): string {
  const value = process.env[name]
  if (!value || value.trim() === '') {
    throw new Error(
      `[env] Variable "${name}" tidak ada atau kosong. Cek .env.local (lihat .env.example).`
    )
  }
  return value
}

function url(name: string): string {
  const value = required(name)
  try {
    new URL(value)
  } catch {
    throw new Error(`[env] Variable "${name}" bukan URL valid: ${value}`)
  }
  return value
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: url('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
} as const
