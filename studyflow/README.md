# 🎓 StudyFlow — Platform Otomasi Akademik Mahasiswa

**StudyFlow** adalah aplikasi web full-stack modern yang dirancang khusus untuk membantu mahasiswa mengelola perkuliahan, melacak tugas kuliah dengan **Auto-Prioritas Cerdas**, memantau jadwal harian, menghitung IPS/IPK, serta memprediksi nilai ujian secara otomatis.

---

## 🚀 Fitur Utama & Fase Pengembangan

| Fase | Modul & Fitur | Status | Deskripsi |
| :--- | :--- | :---: | :--- |
| **Fase 1** | **Setup, Database & Arsitektur** | ✅ Selesai | Next.js 16 (App Router), Prisma ORM, SQLite (`dev.db`), TypeScript ketat, Landing Page interaktif. |
| **Fase 2** | **Autentikasi & Keamanan** | ✅ Selesai | Stateless JWT session (`jose`), password hashing (`bcryptjs`), cookie HTTP-Only, sliding-window rate limiting, Middleware route guard. |
| **Fase 3** | **CRUD Mata Kuliah & Tugas** | ✅ Selesai | Manajemen SKS, jadwal, dosen, ruangan, tag warna. Filter status tugas, pencarian instan, dan auto-prioritas berbasis deadline. |
| **Fase 4** | **Dashboard Analitik Terpadu** | ✅ Selesai | KPI Card (SKS, Progress Tugas %, Tugas Terlambat, Jadwal Hari Ini), Jadwal Kuliah Hari Ini, Alert Overdue, & Ringkasan per Mata Kuliah. |
| **Fase 5** | **Kalkulator Nilai & Prediksi UAS** | ✅ Selesai | Hitung nilai akhir berbasis bobot kustom (10%-20%-30%-40%), simulasi target nilai huruf (A, B+, B), prediksi nilai minimal UAS, dan simulator interaktif What-If. |
| **Fase 6** | **Pengingat Deadline Otomatis** | ✅ Selesai | Otomasi pengingat H-3, H-1, dan hari-H via Telegram Bot (@studyflow_logicloop_bot) langsung ke HP/Laptop mahasiswa. |
| **Fase 7** | **Pengujian & Deployment Cloud** | ✅ Selesai | End-to-end audit, optimasi produksi bundle, dan panduan deployment cloud (Vercel + Supabase/Neon PostgreSQL). |

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) dengan Turbopack
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Bahasa**: [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode)
- **Database ORM**: [Prisma ORM 6](https://www.prisma.io/) dengan SQLite (`prisma/dev.db`) — kompatibel penuh untuk migrasi ke PostgreSQL
- **Keamanan & Validasi**: [Zod](https://zod.dev/), [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js), [Jose JWT](https://github.com/panva/jose)

---

## 💻 Cara Menjalankan Secara Lokal

### 1. Kloning & Masuk ke Direktori
```bash
cd studyflow
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Setup Basis Data & Seeding Demo
```bash
# Push skema database ke SQLite lokal
npx prisma db push

# Isi data demo (mahasiswa, 4 mata kuliah, tugas aktif & overdue)
node prisma/seed.js
```

### 4. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 Akun Demo Siap Pakai

Gunakan kredensial berikut untuk menguji seluruh fitur yang sudah aktif:
- **Email**: `budi.santoso@mahasiswa.ac.id`
- **Password**: `Rahasia123!`

---

## 📡 Rute & Endpoint API

### Autentikasi
- `POST /api/auth/register` — Pendaftaran akun mahasiswa baru (rate-limited)
- `POST /api/auth/login` — Autentikasi email/password & penerbitan JWT HTTP-Only cookie
- `POST /api/auth/logout` — Pembersihan sesi cookie
- `GET /api/auth/me` — Mendapatkan data profil mahasiswa yang sedang aktif

### Analitik Dashboard (Fase 4)
- `GET /api/dashboard` — Menghasilkan metrik KPI, jadwal hari ini, tugas terlambat, tugas terdekat, dan progress per mata kuliah

### Mata Kuliah (Fase 3)
- `GET /api/courses` — Daftar mata kuliah (opsional filter `?semester=1..8`)
- `POST /api/courses` — Tambah mata kuliah baru (+ auto-generate 4 komponen nilai default)
- `GET /api/courses/[id]` — Detail mata kuliah beserta tugas dan komponen nilainya
- `PUT /api/courses/[id]` — Perbarui data mata kuliah
- `DELETE /api/courses/[id]` — Hapus mata kuliah beserta cascade relasi

### Tugas Kuliah (Fase 3)
- `GET /api/tasks` — Daftar tugas dengan filter (`courseId`, `status`, `priority`, `search`)
- `POST /api/tasks` — Tambah tugas baru (auto-prioritas terhitung otomatis)
- `PUT /api/tasks/[id]` — Perbarui data tugas
- `PATCH /api/tasks/[id]` — Toggle cepat status tugas (`TODO` <-> `COMPLETED`)
- `DELETE /api/tasks/[id]` — Hapus tugas

### Kalkulator Nilai & Prediksi UAS (Fase 5)
- `GET /api/grades` — Mengambil data kalkulasi nilai per mata kuliah, proyeksi IPK, dan prediksi nilai UAS
- `PUT /api/grades/[id]` — Memperbarui target nilai huruf dan seluruh komponen bobot/nilai mata kuliah (validasi total 100%)

### Pengingat Otomatis Telegram (Fase 6)
- `POST /api/reminders/trigger` — Menjalankan pemindaian tugas mendesak (< 24 jam) / overdue dan menembakkan notifikasi peringatan langsung ke Telegram bot mahasiswa

---

## ☁️ Panduan Deployment ke Cloud (Vercel + PostgreSQL)

Aplikasi StudyFlow siap 100% untuk dideploy ke internet (Vercel) agar bisa diakses oleh Anda dan teman-teman mahasiswa dari mana saja:

### 1. Buat Database PostgreSQL Gratis (Neon / Supabase)
1. Daftar gratis di [Neon.tech](https://neon.tech) atau [Supabase.com](https://supabase.com).
2. Buat database baru bernama `studyflow`.
3. Salin connection string PostgreSQL yang diberikan, contoh:
   ```text
   postgresql://username:password@ep-sample-123.ap-southeast-1.aws.neon.tech/studyflow?sslmode=require
   ```

### 2. Ubah Provider Prisma untuk Cloud
Di file `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql" // Ubah dari "sqlite" ke "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3. Deploy ke Vercel
1. Push kode ke repository **GitHub**.
2. Masuk ke [Vercel](https://vercel.com) dan impor repository Anda.
3. Di bagian **Environment Variables**, tambahkan:
   - `DATABASE_URL`: Masukkan connection string PostgreSQL dari Neon/Supabase.
   - `NEXTAUTH_SECRET`: String acak aman (minimal 32 karakter).
   - `NEXTAUTH_URL`: Domain web Anda (contoh: `https://studyflow.vercel.app`).
   - `TELEGRAM_BOT_TOKEN`: Token bot Telegram Anda dari @BotFather (`8607185522:...`).
4. Klik **Deploy**!
5. Setelah deploy selesai, sinkronkan skema database cloud sekali saja dari terminal:
   ```bash
   npx prisma db push
   ```

---

## 👥 Cara Teman Anda Menghubungkan Telegram di Web Produksi

1. Teman Anda membuka web StudyFlow Anda dan mendaftarkan akun baru (**Register**).
2. Teman Anda membuka Telegram dan mencari bot: **`@studyflow_logicloop_bot`**, lalu klik **START**.
3. Teman Anda memeriksa ID mereka di bot **`@userinfobot`**.
4. Teman Anda memasukkan angka Chat ID tersebut di widget **Telegram Reminder Bot** pada Dashboard StudyFlow dan klik **Simpan**.
5. Selesai! Bot yang sama akan otomatis membedakan pengiriman pesan ke Telegram masing-masing mahasiswa secara personal.

---

## 🎯 Poin-Poin Kunci untuk Presentasi Kuliah / Tugas Akhir

1. **Problem Statement**:
   - Mahasiswa sering kali mengalami *academic burnout* dan terlambat mengumpulkan tugas karena jadwal perkuliahan terpecah di berbagai grup chat tanpa sistem prioritas yang terukur.
   - Perhitungan nilai akhir perkuliahan sering kali tidak transparan, sehingga mahasiswa tidak tahu berapa nilai UAS minimal yang harus mereka kejar untuk menyelamatkan IPK.

2. **Solusi & Nilai Kebaruan (Value Proposition) StudyFlow**:
   - **Auto-Prioritas Cerdas**: Mengeliminasi kebingungan dengan otomatis menaikkan status tugas ke *Mendesak (URGENT)* saat tenggat waktu tersisa kurang dari 24 jam.
   - **Kalkulator Nilai Prediktif**: Menggunakan rumus pembalik bobot komponen nilai untuk memberitahukan skor minimal ujian yang dibutuhkan demi mengunci target huruf mutu (A/B).
   - **Multi-Tenant Automated Telegram Reminder**: Notifikasi otomatis berbasis push langsung ke perangkat mahasiswa melalui 1 bot Telegram terpusat tanpa biaya SMS/server mahal.

3. **Arsitektur Teknis**:
   - **Next.js 16 (App Router)** dengan arsitektur REST API terpadu.
   - **Stateless JWT Auth** dengan perlindungan cookie *HTTP-Only* dan *Sliding Window Rate Limiter*.
   - **Prisma ORM** yang fleksibel (*Zero-Downtime Migration* dari SQLite lokal ke cloud PostgreSQL).
