# Rencana Pengembangan Trading Journal

## Status Saat Ini
- [x] Fase 1: Setup project (Next.js, Tailwind, shadcn/ui, Supabase, Auth, Middleware)
- [x] Fase 2: Trade Log (form input, tabel lengkap, filter, sort, delete, Symbol CRUD)
- [x] Fase A: Multi-Account (tiap user bisa banyak akun trading, switcher di header, /accounts CRUD, empty-state inline per page)
- [x] Fase B: Mobile Responsive (bottom nav <lg, sidebar lg+, TradeTable card view, modal full-screen, filter bar adaptif, KPI 2-col mobile, calendar grid compact, safe-area inset)
- [x] Fase 3: Dashboard & Visualisasi (Equity Curve, KPI lengkap, Day of Week, Symbol breakdown, Long vs Short)
- [x] Fase 4: Calendar View Interaktif (navigasi bulan, month picker, daily P/L, day detail modal, weekly summary)
- [x] Fase 5: Trade Detail & Edit (modal detail, edit semua field, tags, upload screenshot)
- [x] Fase 6: Analitik Lanjutan (date range filter, streak, drawdown, hourly heatmap, CSV export)

---

## Fase A — Catatan & Future Improvements
- [ ] Edit akun (nama, broker) di /accounts — dialog edit
- [ ] Edit `initial_balance` dengan konfirmasi (warning: akan ubah ROI/equity curve historis)
- [ ] (advanced) Tabel `account_transactions` terpisah untuk deposit/withdraw — modal awal tetap, capital adjustment tracked
- [ ] Archive (soft-delete) akun — bukan hard delete; preserve trade history

---

## Fase 3 — Dashboard & Visualisasi (DONE)
- [x] Equity Curve chart (Recharts)
- [x] KPI cards lengkap: Win Rate, Profit Factor, Avg Win, Avg Loss, Total Net P/L, ROI
- [x] Breakdown per Day of Week (bar chart)
- [x] Breakdown per Symbol (bar chart)
- [x] Breakdown Long vs Short
- [~] ~~Starting capital setting di halaman Settings~~ — obsolet, digantikan `initial_balance` per akun (Fase A multi-account)

## Fase 4 — Calendar View Interaktif (DONE)
- [x] Kalender bulanan navigasi (prev/next month + jump bulan/tahun via picker)
- [x] Tiap hari tampil: jumlah trade, total P/L, warna hijau/merah/abu
- [x] Klik hari → muncul modal daftar trade di hari itu (chained ke TradeDetailModal)
- [x] Monthly summary card: Total P/L, Trading Days, W/L, Best/Worst Day
- [x] Weekly summary (kolom kanan desktop, list di bawah untuk mobile)

## Fase 5 — Trade Detail & Edit (DONE)
- [x] Klik row trade → buka modal detail trade
- [x] Edit trade (semua field bisa diubah)
- [x] Tambah tag/label per trade (TagsInput)
- [x] Upload screenshot chart (Supabase Storage bucket `trade-screenshots`, RLS per user, multi-file, lightbox)

## Fase 6 — Analitik Lanjutan (DONE)
- [x] Filter dashboard by rentang tanggal (7H/30H/90H/MTD/YTD/All/Custom)
- [x] Current Streak KPI (hari berturut-turut profit/loss)
- [x] Max Drawdown KPI ($ + % dari peak)
- [x] Drawdown chart (area chart % drawdown over time)
- [x] Heatmap performa per jam entry (24 cell grid, intensity by net P/L)
- [x] Export data trades ke CSV (semua kolom, UTF-8 BOM untuk Excel)

## Fase B — Mobile Responsive Pass (DONE)
- [x] TradeTable → card view di <md
- [x] Bottom navigation <lg, sidebar lg+
- [x] Modal AddTrade full-screen <sm
- [x] Header adaptif + safe-area-inset-top
- [x] Filter bar /trades responsif (search full-width, 3 select grid, summary bawah)
- [x] Dashboard KPI 2-col di mobile, padding adaptif
- [x] Calendar grid compact di mobile
- [x] Accounts cards: tombol stack di mobile

## Fase 7 — Deploy & Polish
### Pre-deploy hardening (DONE)
- [x] Error boundary: `error.tsx` + `global-error.tsx` + `not-found.tsx` (Next 16 `unstable_retry`)
- [x] Logger utility (`src/lib/logger.ts`) — Vercel Runtime Logs friendly
- [x] Supabase typegen end-to-end (`src/types/database.ts`, typed client/server/middleware)
- [x] Env validation fail-fast (`src/lib/env.ts`) + `.env.example`
- [x] Supabase advisors: RLS perf (auth.uid → (select auth.uid)) + drop duplicate policies + function search_path
- [x] `npm run build` lulus zero warning
- [x] `npm run lint` zero error/warning (React 19 strict rules)
- [x] README maintenance proper (setup, deploy, troubleshooting, struktur folder)
- [x] Lazy-load screenshot thumbnails (`loading="lazy"` + `decoding="async"`)
- [x] Loading skeleton (dashboard, trades, accounts, settings)
- [x] Toast notifications (sonner) untuk semua action CRUD

### Pre-deploy (manual di Supabase Dashboard)
- [ ] **Enable Leaked Password Protection**: Supabase Dashboard → Auth → Providers → Email → toggle "Check passwords against HaveIBeenPwned"

### Deploy
- [ ] Deploy ke Vercel (connect GitHub repo → auto deploy)
- [ ] Setup environment variables di Vercel dashboard
- [ ] Custom domain (opsional)
