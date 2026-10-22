# 🎓 StudyFlow — Platform Otomasi Akademik Mahasiswa

> **LogicLoop Collaboration Project** · Branch: `dev` (Active Development & Feature Integration)

![Branch dev](https://img.shields.io/badge/Branch-dev-blue?style=for-the-badge&logo=git)
![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)
![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript 5](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Prisma ORM](https://img.shields.io/badge/Prisma-6.4-2D3748?style=for-the-badge&logo=prisma)
![SQLite](https://img.shields.io/badge/SQLite-Local_DB-003B57?style=for-the-badge&logo=sqlite)
![Telegram Bot](https://img.shields.io/badge/Telegram_Bot-Integrated-2CA5E0?style=for-the-badge&logo=telegram)

---

## 📌 Daftar Isi
1. [Tentang Proyek & Peran Branch dev](#-tentang-proyek--peran-branch-dev)
2. [Fitur Utama Terintegrasi](#-fitur-utama-terintegrasi)
3. [Tech Stack & Arsitektur](#%EF%B8%8F-tech-stack--arsitektur)
4. [Struktur Branch Repositori](#-struktur-branch-repositori)
5. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
6. [Panduan Instalasi & Menjalankan Lokal](#-panduan-instalasi--menjalankan-lokal)
7. [Kredensial Akun Demo](#-kredensial-akun-demo)
8. [Daftar Endpoint REST API](#-daftar-endpoint-rest-api)
9. [Tautan Artefak Proyek](#-5-tautan-artefak-proyek)
10. [Proses Pengembangan (LogicLoop Team)](#-6-proses-pengembangan)
11. [Panduan Kontribusi & Git Workflow](#-panduan-kontribusi--git-workflow)

---

## 🌟 Tentang Proyek & Peran Branch `dev`

**StudyFlow** adalah platform manajemen akademik dan otomasi perkuliahan *full-stack* modern yang dirancang untuk mengatasi *academic burnout*, membebaskan mahasiswa dari prokrastinasi, dan memberikan visibilitas penuh terhadap performa perkuliahan.

Platform ini mengintegrasikan penjadwalan kuliah harian, pelacakan tenggat tugas dengan **Auto-Prioritas Cerdas**, **Papan Kanban Interaktif**, **Matriks Jadwal Kuliah Mingguan**, **Prediktor Nilai UAS & IPK**, serta **Notifikasi Pengingat Otomatis via Telegram Bot**.

### Peran Utama Branch `dev`:
Branch **`dev`** bertindak sebagai **pusat integrasi aktif dan pengujian fitur harian** bagi seluruh pengembang tim LogicLoop:
* Menggabungkan modul frontend interaktif (Kanban, Matriks Timetable, Ekspor iCal) dari branch `feature`.
* Mengintegrasikan protokol arsitektur agen deterministik (`.agents/`, `AGENTS.md`, `PIPELINE.md`) dari branch `develop`.
* Menyinkronkan spesifikasi antarmuka visual Google Stitch (`.stitch/DESIGN.md`) dari branch `main`.
* Menambahkan peningkatan fitur mandiri: **Kalkulasi Predikat Kelulusan Akademik** (*Cum Laude, Sangat Memuaskan, Memuaskan*) dan **Ekspor Laporan Ringkasan Proyeksi Nilai Akademik (.txt)**.

---

## 🚀 Fitur Utama Terintegrasi

| Modul | Fitur | Status | Deskripsi |
| :--- | :--- | :---: | :--- |
| **⚡ Task Automation** | **Smart Auto-Priority** | ✅ Aktif | Algoritma klasifikasi urgensi otomatis (`URGENT`, `HIGH`, `MEDIUM`, `LOW`) berbasis hitung mundur deadline (< 24 jam otomatis mendesak). |
| **📋 Task Board** | **Papan Kanban Interaktif** | ✅ Aktif | Tampilan dual-view (*List View* & *Kanban Board* 3-kolom: `TODO`, `IN_PROGRESS`, `COMPLETED`) dengan aksi cepat sekali klik. |
| **📅 Timetable** | **Matriks Jadwal Mingguan** | ✅ Aktif | Visualisasi grid perkuliahan 7 hari (Senin–Minggu) dengan penanda otomatis **`HARI INI`** dan penyesuaian jam mulai kelas. |
| **📲 Calendar Sync** | **Ekspor iCal RFC 5545 (`.ics`)** | ✅ Aktif | Ekspor seluruh jadwal kuliah mingguan dalam 1 klik untuk sinkronisasi ke **Google Calendar**, **Apple Calendar**, dan **Microsoft Outlook**. |
| **🎯 Academic Grade** | **Kalkulator & Prediktor UAS** | ✅ Aktif | Formula invers bobot untuk menghitung skor minimal ujian akhir (UAS) demi mengunci target huruf mutu (A, B+, B), dilengkapi simulator *What-If*. |
| **🏆 Honor Status** | **Predikat Kelulusan & Ekspor Nilai** | ✅ Aktif | Kalkulasi otomatis status predikat (*Cum Laude*, Sangat Memuaskan, Memuaskan) dan unduhan berkas laporan proyeksi nilai akademik. |
| **📊 Dashboard KPI** | **Unified Academic Dashboard** | ✅ Aktif | Ringkasan metrik KPI (Total SKS, % Progress Tugas, Tugas Terlambat, Jadwal Kuliah Hari Ini, Banner Peringatan Overdue). |
| **🤖 Push Reminder** | **Notifikasi Bot Telegram** | ✅ Aktif | Otomasi pengingat tugas mendesak dan agenda kuliah harian via bot `@studyflow_logicloop_bot` langsung ke smartphone mahasiswa. |
| **🔒 Security & Auth** | **Stateless JWT & HTTP-Only** | ✅ Aktif | Keamanan sesi stateless menggunakan `jose`, enkripsi sandi `bcryptjs` (salt 12), validasi Zod, dan route guard middleware. |

---

## 🛠️ Tech Stack & Arsitektur

* **Framework Inti**: Next.js 16 (App Router) dengan kompilasi Turbopack
* **Frontend UI**: React 19, Tailwind CSS v4, Lucide React Icons
* **Bahasa**: TypeScript 5 (Strict Mode tanpa `any`)
* **Database & ORM**: Prisma ORM 6 dengan basis data SQLite lokal (`dev.db`), siap migrasi ke PostgreSQL (Neon / Supabase)
* **Keamanan & Autentikasi**: Stateless JWT (`jose`), Bcrypt.js, Zod Schema Validation, Cookie HTTP-Only
* **Otomasi Kalender & Ekspor**: Standar iCalendar RFC 5545 (`.ics`)
* **Integrasi Eksternal**: Telegram Bot API Webhook

---

## 🌿 Struktur Branch Repositori

Repositori ini menerapkan standar *Git Workflow* terstruktur:

* **`main`** : Branch produksi stabil (*Production Ready*) dan spesifikasi desain Stitch.
* **`develop`** : Branch integrasi arsitektur agen dan pipeline AI (`.agents/skills/`).
* **`dev`** : **Branch aktif pengembangan lokal & integrasi fitur menyeluruh (Current Branch).**
* **`feature`** : Branch pengembangan modul fitur spesifik (Kanban, Jadwal Mingguan, iCal).
* **`fix`** : Branch untuk hotfix dan perbaikan bug sistem.

---

## 📂 Struktur Direktori Proyek

```text
project logicloop/
├── .agents/                       # Antigravity Agentic Skills & Automation (25 Skills)
│   └── skills/                    # ui-ux-pro-max, frontend-design, stitch-review, dll.
├── .stitch/                       # Spesifikasi Desain Google Stitch
│   └── DESIGN.md                  # Semantic token, palette dark mode, screen matrix
├── .vscode/                       # Pengaturan editor VS Code & formatters
├── AGENTS.md                      # Master Workspace & Engineering Rules (Anti-Slop)
├── PIPELINE.md                    # Dokumentasi alur kerja agen 7-fase
├── README.md                      # Dokumentasi utama repositori (Branch dev)
├── package.json                   # Root workspace scripts runner
├── tsconfig.json                  # Root TypeScript configurations
└── studyflow/                     # Sumber kode aplikasi Next.js 16
    ├── README.md                  # Dokumentasi internal aplikasi StudyFlow
    ├── prisma/
    │   ├── schema.prisma          # Skema basis data (User, Course, Task, Grade, Reminder)
    │   ├── seed.js                # Skrip seeding data demo mahasiswa & perkuliahan
    │   └── dev.db                 # Database SQLite lokal
    ├── public/                    # Aset statis & logo
    └── src/
        ├── app/
        │   ├── (auth)/            # Halaman Login & Registrasi Mahasiswa
        │   ├── (dashboard)/       # Halaman Dashboard, Courses (Timetable), Tasks (Kanban), Grades
        │   ├── api/               # Endpoint REST API backend
        │   ├── globals.css        # Tailwind CSS v4 stylesheets
        │   ├── layout.tsx         # Root application layout
        │   └── page.tsx           # Interactive Landing Page
        ├── components/
        │   ├── layout/            # AppShell, Topbar, Sidebar navigasi
        │   └── ui/                # Button, Card, Badge atomik
        ├── lib/
        │   ├── auth.ts            # Stateless JWT utilities (jose)
        │   ├── prisma.ts          # Singleton Prisma Client instance
        │   ├── rate-limit.ts      # Sliding-window in-memory rate limiter
        │   ├── telegram.ts        # Telegram bot push notification dispatcher
        │   └── utils.ts           # Auto-priority, Prediksi UAS, GPA, iCal (.ics), & Grade Report
        ├── middleware.ts          # Route guard & cookie token validator
        └── types/                 # Definisi tipe TypeScript global
```

---

## 💻 Panduan Instalasi & Menjalankan Lokal

### Prasyarat Sistem
* **Node.js**: Versi 20 LTS atau 22 LTS
* **npm**: Versi 10+
* **Git**: Versi 2.40+

### 1. Kloning Repositori & Pindah ke Branch `dev`
```bash
git clone -b dev https://github.com/oliksupriadi-exe92/LogicLoop_Project_.git
cd LogicLoop_Project_
```

### 2. Pasang Dependensi Aplikasi
```bash
cd studyflow
npm install
```

### 3. Setup Basis Data & Seeding Data Awal
```bash
# Push skema Prisma ke database SQLite lokal
npx prisma db push

# Isi data demo (Akun mahasiswa demo, 4 mata kuliah, tugas aktif & overdue)
node prisma/seed.js
```

### 4. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban di tautan: **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 Kredensial Akun Demo

Untuk mencoba langsung seluruh fitur tanpa registrasi manual:
* **Email**: `budi.santoso@mahasiswa.ac.id`
* **Password**: `Rahasia123!`

---

## 📡 Daftar Endpoint REST API

| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Pendaftaran akun mahasiswa baru (rate-limited) |
| `POST` | `/api/auth/login` | Login mahasiswa & penerbitan JWT HTTP-Only cookie |
| `POST` | `/api/auth/logout` | Pembersihan sesi cookie & logout |
| `GET` | `/api/auth/me` | Profil mahasiswa aktif |
| `PATCH`| `/api/auth/me` | Memperbarui Telegram Chat ID mahasiswa |
| `GET` | `/api/dashboard` | Metrik KPI, jadwal kuliah hari ini, tugas overdue & terdekat |
| `GET` | `/api/courses` | Daftar mata kuliah (opsional `?semester=1..8`) |
| `POST` | `/api/courses` | Tambah mata kuliah (+ auto-generate 4 komponen nilai) |
| `GET` | `/api/courses/[id]` | Detail mata kuliah beserta tugas dan komponen nilainya |
| `PUT` | `/api/courses/[id]` | Perbarui data mata kuliah |
| `DELETE`| `/api/courses/[id]` | Hapus mata kuliah beserta cascade relasi tugas & nilai |
| `GET` | `/api/tasks` | Daftar tugas (filter: `courseId`, `status`, `priority`, `search`) |
| `POST` | `/api/tasks` | Tambah tugas baru (auto-prioritas dihitung otomatis) |
| `PUT` | `/api/tasks/[id]` | Perbarui rincian tugas |
| `PATCH`| `/api/tasks/[id]` | Transisi status tugas (`TODO` ⇄ `IN_PROGRESS` ⇄ `COMPLETED`) |
| `DELETE`| `/api/tasks/[id]` | Hapus tugas |
| `GET` | `/api/grades` | Kalkulasi nilai per MK, proyeksi IPK, prediksi nilai UAS |
| `PUT` | `/api/grades/[id]` | Update target huruf & persentase bobot komponen (validasi 100%) |
| `POST` | `/api/reminders/trigger` | Trigger pemindaian tugas mendesak & kirim pengingat Telegram |

---

## 🔗 5. Tautan Artefak Proyek

| Artefak | Tautan | Catatan (maks. 15 kata) |
| :--- | :--- | :--- |
| **Repository** | `https://github.com/oliksupriadi-exe92/LogicLoop_Project_` | Repositori publik berisi kode Next.js 16, skema database, dokumentasi, dan seluruh branch pengembangan. |
| **Pitch deck** | `https://docs.google.com/presentation/d/YOUR_PITCH_DECK_LINK` | Slide presentasi memuat latar belakang masalah, solusi, arsitektur sistem, dan demo aplikasi StudyFlow. |
| **Stitch project** | `https://stitch.withgoogle.com/projects/YOUR_PROJECT_ID` | Prototipe rancangan antarmuka visual dan komponen UI aplikasi StudyFlow di Google Stitch. |

---

## 📋 6. Proses Pengembangan

### Pembagian kontribusi: (maks. 100 kata)
> Pengembangan StudyFlow dibagi secara terstruktur ke dalam tiga fokus utama kolaborasi tim LogicLoop:
> 1. **Frontend & UI/UX**: Merancang antarmuka responsif menggunakan Next.js 16 (App Router), Tailwind CSS v4, dan Lucide Icons untuk landing page interaktif, dashboard analitik, papan kanban tugas, dan matriks jadwal kuliah mingguan.
> 2. **Backend & Database**: Mengembangkan skema database Prisma ORM, REST API, sistem autentikasi aman berbasis stateless JWT (`jose`), password hashing (`bcryptjs`), rate limiting, dan proteksi route guard.
> 3. **Logika Bisnis & Integrasi**: Mengimplementasikan algoritma auto-prioritas tugas berbasis sisa waktu, formula kalkulator prediksi nilai UAS invers bobot, sinkronisasi kalender iCal RFC 5545, serta integrasi webhook notifikasi otomatis bot Telegram.

### Tantangan utama: (maks. 75 kata)
> Tantangan utama meliputi perancangan formula matematis prediktor nilai UAS yang harus fleksibel terhadap bobot dinamis komponen perkuliahan, penentuan auto-prioritas tugas secara akurat saat mendekati tenggat waktu, serta pengiriman notifikasi pengingat via Telegram Bot ke banyak mahasiswa secara personal tanpa menggunakan server worker eksternal berbayar. Selain itu, integrasi Next.js 16 dan Tailwind CSS v4 memerlukan penyesuaian konvensi arsitektur dan penanganan tipe TypeScript yang ketat.

### Solusi atas tantangan: (maks. 100 kata)
> Solusi yang diterapkan:
> 1. **Formula Invers Bobot**: Mengembangkan fungsi prediksi inversi linear yang memvalidasi batas kelayakan nilai (0–100) secara transparan serta simulator What-If interaktif.
> 2. **Algoritma Waktu Relatif**: Memanfaatkan fungsi utilitas kalkulasi selisih jam deadline untuk klasifikasi prioritas otomatis (*Urgent, High, Medium, Low*) tanpa beban komputasi berat.
> 3. **Penyimpanan Chat ID Personal**: Menyimpan Telegram Chat ID unik pada profil pengguna di database melalui Prisma, sehingga satu bot sentral dapat mendistribusikan notifikasi personal via REST endpoint.
> 4. **Konfigurasi Strict TypeScript**: Menerapkan validasi skema data Zod di seluruh rute API untuk menjamin kestabilan sistem.

---

## 🔄 Panduan Kontribusi & Git Workflow

Untuk menjaga integritas kode pada branch `dev`:

1. **Buat Branch Lokal Baru / Kerjakan di `dev`**:
   ```bash
   git checkout dev
   git pull origin dev
   ```
2. **Format Pesan Komit Semantik (*Conventional Commits*)**:
   - `feat(dev): <fitur baru>`
   - `fix(dev): <perbaikan bug>`
   - `docs(dev): <perubahan dokumentasi>`
   - `refactor(dev): <peningkatan struktur kode>`
3. **Validasi Sebelum Komit**:
   Pastikan tidak ada error TypeScript dan kode terformat dengan rapi sebelum mengajukan *Pull Request* ke branch `develop` atau `main`.
