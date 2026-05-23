# Rencana Pengembangan Trading Journal

## Status Saat Ini
- [x] Fase 1: Setup project (Next.js, Tailwind, shadcn/ui, Supabase, Auth, Middleware)
- [x] Fase 2: Trade Log (form input, tabel lengkap, filter, sort, delete, Symbol CRUD)
- [x] Fase A: Multi-Account (tiap user bisa banyak akun trading, switcher di header, /accounts CRUD, empty-state inline per page)

---

## Fase A — Catatan & Future Improvements
- [ ] Edit akun (nama, broker) di /accounts — dialog edit
- [ ] Edit `initial_balance` dengan konfirmasi (warning: akan ubah ROI/equity curve historis)
- [ ] (advanced) Tabel `account_transactions` terpisah untuk deposit/withdraw — modal awal tetap, capital adjustment tracked
- [ ] Archive (soft-delete) akun — bukan hard delete; preserve trade history

---

## Fase 3 — Dashboard & Visualisasi
- [ ] Equity Curve chart (Recharts) — grafik pertumbuhan akun dari waktu ke waktu
- [ ] KPI cards lengkap: Win Rate, Profit Factor, Avg Win, Avg Loss, Total Net P/L, ROI
- [ ] Breakdown per Day of Week (bar chart — hari apa paling profit)
- [ ] Breakdown per Symbol (bar chart — symbol mana paling menguntungkan)
- [ ] Breakdown Long vs Short
- [ ] Starting capital setting di halaman Settings

## Fase 4 — Calendar View Interaktif
- [ ] Kalender bulanan navigasi (prev/next month)
- [ ] Tiap hari tampil: jumlah trade, total P/L, warna hijau/merah/abu
- [ ] Klik hari → muncul popup daftar trade di hari itu
- [ ] Weekly summary di sisi kanan kalender

## Fase 5 — Trade Detail & Edit
- [ ] Klik row trade → buka halaman detail trade
- [ ] Edit trade (semua field bisa diubah)
- [ ] Upload screenshot chart (Supabase Storage)
- [ ] Tambah tag/label per trade (misal: revenge trade, FOMO, A+ setup)

## Fase 6 — Analitik Lanjutan
- [ ] Filter dashboard by rentang tanggal (minggu ini, bulan ini, custom range)
- [ ] Streak tracking (berapa hari berturut-turut profit/loss)
- [ ] Drawdown chart (max drawdown dari equity peak)
- [ ] Heatmap performa per jam entry
- [ ] Export data trades ke CSV

## Fase B — Mobile Responsive Pass (NEXT)
- [ ] TradeTable → card view di breakpoint <md (table sulit di-scroll di HP)
- [ ] Bottom navigation untuk mobile (Sidebar disembunyikan, ganti bottom-nav)
- [ ] Modal AddTrade → full-screen sheet di mobile (saat ini kepotong)
- [ ] Header: account switcher tetap visible di mobile, sembunyikan title page
- [ ] Audit touch targets (min 44px) & overflow di semua page

## Fase 7 — Deploy & Polish
- [ ] Deploy ke Vercel (connect GitHub repo → auto deploy)
- [ ] Setup environment variables di Vercel dashboard
- [ ] Custom domain (opsional)
- [ ] Loading skeleton untuk semua halaman
- [ ] Error boundary & toast notifications
