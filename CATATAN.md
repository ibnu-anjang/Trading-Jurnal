# Rencana Pengembangan Trading Journal

## Status Saat Ini
- [x] Fase 1: Setup project (Next.js, Tailwind, shadcn/ui, Supabase, Auth, Middleware)
- [x] Fase 2: Trade Log (form input, tabel lengkap, filter, sort, delete, Symbol CRUD)

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

## Fase 7 — Deploy & Polish
- [ ] Deploy ke Vercel (connect GitHub repo → auto deploy)
- [ ] Setup environment variables di Vercel dashboard
- [ ] Custom domain (opsional)
- [ ] Loading skeleton untuk semua halaman
- [ ] Error boundary & toast notifications
- [ ] Responsive mobile layout
