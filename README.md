# 🎓 StudyFlow — Platform Otomasi Akademik Mahasiswa
> **LogicLoop Collaboration Project** · Branch: `feature` (Lead: [@alihafidz-boop](https://github.com/alihafidz-boop))

![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)
![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Prisma ORM](https://img.shields.io/badge/Prisma-6.4-2D3748?style=for-the-badge&logo=prisma)
![SQLite](https://img.shields.io/badge/SQLite-Local_DB-003B57?style=for-the-badge&logo=sqlite)
![Telegram Bot](https://img.shields.io/badge/Telegram_Bot-Integrated-2CA5E0?style=for-the-badge&logo=telegram)

---

## 📌 Ringkasan Proyek

**StudyFlow** adalah platform manajemen akademik full-stack terintegrasi yang dirancang khusus untuk membebaskan mahasiswa dari stres akademik (*academic burnout*). Aplikasi ini menggabungkan manajemen perkuliahan, **Auto-Prioritas Tugas Cerdas**, **Papan Kanban Interaktif**, **Matriks Jadwal Kuliah Mingguan**, **Prediktor Nilai UAS & IPK**, serta **Notifikasi Push Otomatis via Telegram Bot**.

Branch **`feature`** menghadirkan pembaruan alur kerja dan visualisasi produktivitas modern yang dirancang untuk mempercepat penyelesaian tugas dan mempermudah pengelolaan jadwal perkuliahan harian.

---

## 🌟 Fitur Unggulan Branch `feature`

### 1. 📋 Papan Kanban Interaktif (*Task Kanban Board*)
- **Dual-View Switcher**: Mahasiswa dapat beralih secara instan antara **Tampilan Daftar (List)** dan **Papan Kanban (Board)**.
- **3 Kolom Alur Kerja Tugas**:
  - 📝 **Belum Dikerjakan (`TODO`)**: Menampung tugas baru dengan tombol sekali klik *"Mulai"* untuk langsung masuk ke tahap pengerjaan.
  - ⚡ **Sedang Dikerjakan (`IN_PROGRESS`)**: Memantau tugas aktif dengan tombol *"Selesai"* atau *"Todo"*.
  - ✅ **Selesai (`COMPLETED`)**: Riwayat tugas yang sudah tuntas dengan opsi *"Buka Kembali"*.
- **Auto-Prioritas Terintegrasi**: Mengklasifikasikan urgensi tugas secara otomatis (`URGENT`, `HIGH`, `MEDIUM`, `LOW`) berdasarkan kedekatan batas waktu (< 24 jam = URGENT beranimasi denyut merah).
- **Hitung Mundur Deadline Real-time**: Menampilkan sisa waktu relatif (misal *"2 jam lagi"*, *"Besok"*, atau *"Terlambat 3 jam lalu"*).

### 2. 📅 Matriks Jadwal Kuliah Mingguan (*Weekly Timetable Matrix*)
- **Visual Grid 7 Hari (Senin — Minggu)**: Mengelompokkan seluruh mata kuliah secara horizontal/vertikal per hari kuliah dan berurutan sesuai jam mulai kelas.
- **Penanda Hari Aktif Otomatis**: Kolom hari saat ini otomatis ditandai dengan badge menyala **`HARI INI`** dan border aksen indigo.
- **Kartu Mata Kuliah Berwarna**: Dilengkapi nama dosen, ruangan kelas/link daring, bobot SKS, tag warna kustom, dan tautan langsung ke tugas terkait.

### 3. 📲 Ekspor Kalender iCal RFC 5545 (`.ics`)
- **One-Click Export**: Tombol **"Ekspor iCal"** di halaman mata kuliah menghasilkan berkas `.ics` terstandarisasi.
- **Dukungan Aplikasi Kalender Luas**: Jadwal kuliah berulang (*weekly recurring*) dapat langsung diimpor ke **Google Calendar**, **Apple Calendar**, dan **Microsoft Outlook** di laptop maupun smartphone.

---

## 🚀 Fitur Lengkap StudyFlow

| Fase | Modul & Fitur | Status | Deskripsi |
| :--- | :--- | :---: | :--- |
| **Fase 1** | **Setup & Arsitektur** | ✅ Selesai | Next.js 16 (App Router) Turbopack, Prisma ORM, SQLite (`dev.db`), TypeScript ketat, Landing Page interaktif. |
| **Fase 2** | **Autentikasi & Keamanan** | ✅ Selesai | Stateless JWT session (`jose`), password hashing (`bcryptjs`), cookie HTTP-Only, sliding-window rate limiting, Middleware route guard. |
| **Fase 3** | **Mata Kuliah & Tugas** | ✅ Selesai | Manajemen SKS, dosen, jadwal, filter status tugas, pencarian instan, **Papan Kanban**, **Matriks Jadwal Mingguan**, & **Ekspor iCal**. |
| **Fase 4** | **Dashboard Analitik** | ✅ Selesai | KPI Card (SKS, Progress Tugas %, Tugas Terlambat, Jadwal Hari Ini), Jadwal Kuliah Hari Ini, Alert Overdue, & Ringkasan per MK. |
| **Fase 5** | **Kalkulator Nilai & UAS** | ✅ Selesai | Bobot kustom (Presensi, Tugas, UTS, UAS), simulasi target huruf mutu (A, B+, B), prediktor nilai minimal UAS, simulator What-If. |
| **Fase 6** | **Pengingat Telegram** | ✅ Selesai | Pengingat otomatis H-3, H-1, & hari-H via Telegram Bot (`@studyflow_logicloop_bot`) langsung ke perangkat mahasiswa. |
| **Fase 7** | **Audit & Cloud Ready** | ✅ Selesai | 0 error TypeScript / Next build, kompatibilitas migrasi PostgreSQL (Neon / Supabase). |

---

## 💻 Panduan Menjalankan Secara Lokal

### Prasyarat
- **Node.js**: versi 20 atau 22 LTS
- **npm**: versi 10+

### 1. Masuk ke Direktori Aplikasi
```bash
cd studyflow
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Inisialisasi Basis Data & Data Demo (Seeding)
```bash
# Generate Prisma Client & Push skema database SQLite
npx prisma db push

# Isi data awal (Akun mahasiswa demo, 4 mata kuliah, tugas aktif & overdue)
node prisma/seed.js
```

### 4. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka browser pada tautan: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Kredensial Akun Demo

Untuk menguji seluruh fitur yang telah aktif tanpa perlu registrasi manual:
- **Email**: `budi.santoso@mahasiswa.ac.id`
- **Password**: `Rahasia123!`

---

## 📂 Struktur Repositori

```text
LogicLoop_Project_/
├── README.md                      # Dokumentasi utama repositori (Branch Feature)
├── package.json                   # Root workspace scripts
├── tsconfig.json                  # Root TypeScript configuration
├── Agents.md/                     # Submodule aturan arsitektur & master engineering rules
└── studyflow/                     # Aplikasi utama Next.js 16 (App Router)
    ├── README.md                  # Dokumentasi teknis aplikasi StudyFlow
    ├── prisma/
    │   ├── schema.prisma          # Skema database Prisma ORM (User, Course, Task, Grade, Reminder)
    │   ├── seed.js                # Skrip demo data mahasiswa & perkuliahan
    │   └── dev.db                 # SQLite local database
    ├── public/                    # Aset statis & ikon
    └── src/
        ├── app/
        │   ├── (auth)/            # Halaman Login & Register
        │   ├── (dashboard)/       # Halaman Dashboard, Courses, Tasks (Kanban), Grades
        │   ├── api/               # Endpoint REST API (Auth, Courses, Tasks, Grades, Reminders)
        │   └── page.tsx           # Interactive Landing Page
        ├── components/
        │   ├── layout/            # AppShell, Topbar, Sidebar
        │   └── ui/                # Button, Card, Badge atomik
        ├── lib/
        │   ├── auth.ts            # Stateless JWT utilities (jose)
        │   ├── prisma.ts          # Singleton Prisma client
        │   ├── rate-limit.ts      # Sliding-window in-memory rate limiter
        │   ├── telegram.ts        # Telegram bot push notification sender
        │   └── utils.ts           # Auto-priority, Prediksi UAS, GPA, & iCal (.ics) generator
        ├── middleware.ts          # Next.js route guard untuk rute terproteksi
        └── types/                 # Definisi tipe TypeScript global
```

---

## 📡 Daftar Endpoint REST API

| Method | Endpoint | Fungsi |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Pendaftaran akun mahasiswa baru (rate-limited) |
| `POST` | `/api/auth/login` | Login mahasiswa & penerbitan JWT HTTP-Only cookie |
| `POST` | `/api/auth/logout` | Pembersihan sesi cookie |
| `GET` | `/api/auth/me` | Profil mahasiswa yang sedang aktif |
| `GET` | `/api/dashboard` | KPI metrik, jadwal kuliah hari ini, tugas overdue & terdekat |
| `GET` | `/api/courses` | Daftar mata kuliah (opsional `?semester=1..8`) |
| `POST` | `/api/courses` | Tambah mata kuliah (+ auto-generate 4 komponen nilai) |
| `PUT` | `/api/courses/[id]` | Perbarui rincian mata kuliah |
| `DELETE`| `/api/courses/[id]` | Hapus mata kuliah beserta cascade relasi |
| `GET` | `/api/tasks` | Daftar tugas (filter: `courseId`, `status`, `priority`, `search`) |
| `POST` | `/api/tasks` | Tambah tugas baru (auto-prioritas terhitung otomatis) |
| `PUT` | `/api/tasks/[id]` | Perbarui detail tugas |
| `PATCH`| `/api/tasks/[id]` | Transisi status tugas (`TODO` ⇄ `IN_PROGRESS` ⇄ `COMPLETED`) |
| `DELETE`| `/api/tasks/[id]` | Hapus tugas |
| `GET` | `/api/grades` | Kalkulasi nilai per MK, proyeksi IPK, prediksi nilai UAS |
| `PUT` | `/api/grades/[id]` | Update target nilai huruf & persentase bobot komponen |
| `POST` | `/api/reminders/trigger` | Trigger pemindaian tugas mendesak & kirim bot Telegram |

---

## 👥 Kolaborasi Tim & Pembagian Tugas (LogicLoop)

1. **Frontend & UI/UX**:
   - Merancang antarmuka modern yang responsif menggunakan Next.js 16 (App Router), Tailwind CSS v4, dan Lucide Icons.
   - Mengembangkan **Papan Kanban Interaktif**, **Matriks Jadwal Mingguan**, dan interaksi kartu tugas.
2. **Backend & Basis Data**:
   - Mengembangkan skema database Prisma ORM dan penanganan REST API yang aman.
   - Mengimplementasikan sistem autentikasi stateless JWT (`jose`), password hashing (`bcryptjs`), rate limiting, dan proteksi middleware.
3. **Logika Bisnis & Integrasi Otomasi**:
   - Mengimplementasikan algoritma auto-prioritas cerdas berbasis kedekatan batas waktu.
   - Mengembangkan formula invers bobot prediktor nilai UAS dan kalkulasi IPS/IPK otomatis.
   - Mengintegrasikan webhook pengingat Telegram Bot terpusat (`@studyflow_logicloop_bot`) serta utilitas ekspor berkas iCalendar (.ics).

---

## 📄 Lisensi & Kontribusi

Proyek ini dikembangkan secara kolaboratif untuk tugas proyek **LogicLoop**. Hak cipta dan seluruh kontribusi dilindungi untuk keperluan akademik dan pengembangan sistem otomasi perkuliahan mahasiswa.
