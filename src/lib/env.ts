/**
 * Validasi environment variables di startup.
 * Throw saat module pertama kali di-import kalau ada env hilang/invalid.
 * Fail-fast > crash random di tengah jalan.
 *
 * PENTING: NEXT_PUBLIC_* harus diakses literal (process.env.FOO), bukan bracket
 * (process.env[name]). Webpack/Turbopack hanya replace literal access di client bundle.
 */

function validateRequired(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(
      `[env] Variable "${name}" tidak ada atau kosong. Cek .env.local (lihat .env.example).`
    )
  }
  return value
}

function validateUrl(name: string, value: string | undefined): string {
  const v = validateRequired(name, value)
  try {
    new URL(v)
  } catch {
    throw new Error(`[env] Variable "${name}" bukan URL valid: ${v}`)
  }
  return v
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: validateUrl(
    'NEXT_PUBLIC_SUPABASE_URL',
    process.env.NEXT_PUBLIC_SUPABASE_URL
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: validateRequired(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ),
} as const
