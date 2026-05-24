# Trading Journal

Web app untuk track, analisa, dan tingkatkan performa trading. Mendukung multi-akun, screenshot chart, dan analitik lanjutan.

**Stack**: Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres + Auth + Storage) · Recharts · Sonner.

---

## Setup Lokal

### 1. Prasyarat
- Node.js 20+
- npm (atau pnpm/yarn)
- Project Supabase (gratis di [supabase.com](https://supabase.com))

### 2. Install
```bash
git clone <repo-url>
cd trading-jurnal
npm install
```

### 3. Environment
Copy template lalu isi nilai sebenarnya:
```bash
cp .env.example .env.local
```

Ambil credential dari **Supabase Dashboard → Project Settings → API**:
- `NEXT_PUBLIC_SUPABASE_URL` — Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — `anon` public key

### 4. Database
Migration sudah ada di Supabase project (akun trading, trades, symbols, screenshots bucket, RLS policies). Kalau setup project Supabase baru, jalankan ulang via Supabase MCP (`apply_migration`) atau copy SQL dari history.

### 5. Run
```bash
npm run dev      # development server, http://localhost:3000
npm run build    # production build
npm run start    # production server (setelah build)
npm run lint     # ESLint
npx tsc --noEmit # type check
```

---

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Di [vercel.com](https://vercel.com) → **Add New** → **Project** → import repo.
3. **Environment Variables**: tambah `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (sama persis dengan `.env.local`).
4. Deploy. URL preview akan muncul, auto-deploy setiap push ke branch.

**Lihat error production**: Vercel Dashboard → project → **Logs** → filter berdasar `[ERROR]` atau `[scope]` (lihat `src/lib/logger.ts`).

---

## Maintenance Tasks

### Menambah migration database
1. Tulis SQL untuk schema change.
2. Apply via Supabase MCP: `mcp__supabase__apply_migration` (preferred) atau Supabase Dashboard → SQL Editor.
3. Regenerate TypeScript types: `mcp__supabase__generate_typescript_types` → tempel ke `src/types/database.ts`.
4. Fix typecheck error yang muncul → commit.

### Cek security & performance Supabase
```
mcp__supabase__get_advisors --type security
mcp__supabase__get_advisors --type performance
```
Jalankan setelah perubahan DDL.

### Rollback migration
Tulis migration baru yang membalik perubahan (Postgres tidak punya `--down` otomatis). Jangan edit migration yang sudah dideploy.

### Tambah env variable baru
1. Tambah ke `.env.example` (template) dan `.env.local` (nilai lokal).
2. Tambah validator di `src/lib/env.ts`.
3. Set di Vercel Dashboard → Settings → Environment Variables.

### Update screenshot bucket policy
File: lihat migration `trade_screenshots` di Supabase. Policy pakai `auth.uid()::text = (storage.foldername(name))[1]` — folder pertama harus user_id.

---

## Struktur Project

```
src/
├── app/                  # App Router (auth + dashboard route groups)
│   ├── (auth)/           # /login, /register
│   ├── (dashboard)/      # / (dashboard), /trades, /calendar, /accounts, /settings
│   ├── error.tsx         # per-segment error boundary
│   ├── global-error.tsx  # root fatal error
│   └── not-found.tsx     # 404
├── components/
│   ├── ui/               # shadcn-style primitives
│   ├── dashboard/        # KPI cards, charts, filters
│   ├── trades/           # tabel, modal, uploader
│   ├── calendar/         # day detail modal
│   └── layout/           # header, sidebar, bottom nav
├── contexts/             # React contexts (ActiveAccount)
├── hooks/                # useTrades, useSymbols, useAccounts, useActiveAccount
├── lib/
│   ├── supabase/         # client.ts (browser) + server.ts (SSR)
│   ├── env.ts            # env validator (fail-fast)
│   ├── logger.ts         # log wrapper untuk Vercel Runtime Logs
│   ├── csv.ts            # CSV export trades
│   └── utils.ts          # formatCurrency, formatDate, cn
├── types/
│   ├── database.ts       # AUTO-GENERATED dari Supabase
│   └── trade.ts          # domain types
└── middleware.ts         # auth gate (root)
```

---

## Troubleshooting

| Gejala | Solusi |
|---|---|
| Build fail `[env]` | Pastikan `.env.local` ada & punya value. Lihat `.env.example`. |
| Query selalu return `[]` | RLS aktif tapi user belum login. Cek session di browser DevTools → Application → Cookies. |
| Screenshot upload fail | Cek bucket `trade-screenshots` ada di Supabase Storage, policy RLS aktif, file <5 MB. |
| Type error setelah migration | Regenerate `src/types/database.ts` (lihat Maintenance Tasks). |
| Hydration mismatch | Cek client/server component boundary, terutama Toaster di `src/app/layout.tsx`. |

---

## Catatan Development

- Fase-fase pengembangan didokumentasikan di [`CATATAN.md`](./CATATAN.md).
- Convention Next.js 16 versi ini ada perubahan dari training data — selalu cek `node_modules/next/dist/docs/` sebelum nulis kode baru.
- Tidak ada test suite — perubahan diverifikasi via `tsc --noEmit` + `npm run lint` + manual UI test.
