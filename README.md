# 🎓 StudyFlow — Platform Otomasi Akademik Mahasiswa

> **StudyFlow** adalah platform manajemen akademik dan otomasi perkuliahan *full-stack* modern yang dirancang untuk membantu mahasiswa menuntaskan tugas tepat waktu dengan **Auto-Prioritas Cerdas**, mengelola jadwal harian, menghitung IPS/IPK, serta memprediksi nilai minimal UAS yang dibutuhkan secara otomatis.

![Next.js 16](https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js&logoColor=white)
![React 19](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript 5](https://img.shields.io/badge/TypeScript%205-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS%204-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma ORM](https://img.shields.io/badge/Prisma%20ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Branch main](https://img.shields.io/badge/Branch-main-success?style=for-the-badge&logo=git)

---

## 📌 Daftar Isi
1. [Tentang Proyek](#-tentang-proyek)
2. [Fitur Utama](#-fitur-utama)
3. [Tech Stack](#%EF%B8%8F-tech-stack)
4. [Struktur Branch Repositori](#-struktur-branch-repositori)
5. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
6. [Panduan Instalasi & Menjalankan Lokal](#-panduan-instalasi--menjalankan-lokal)
7. [Kredensial Akun Demo](#-kredensial-akun-demo)
8. [Tautan Artefak Proyek](#-5-tautan-artefak-proyek)
9. [Proses Pengembangan](#-6-proses-pengembangan)

---

## 🌟 Tentang Proyek

Mahasiswa sering mengalami kendala *procrastination*, kebingungan menentukan prioritas tugas di tengah jadwal kuliah yang padat, serta ketidakpastian target nilai akhir semester. **StudyFlow** hadir sebagai asisten cerdas all-in-one yang mengintegrasikan:
- Penjadwalan kuliah harian.
- Pelacakan tenggat tugas dengan kalkulasi urgensi otomatis.
- Simulator nilai & prediktor nilai ujian berbasis invers bobot.
- Notifikasi push langsung ke ponsel via **Telegram Bot**.

---

## 🚀 Fitur Utama

| Fitur | Deskripsi |
| :--- | :--- |
| **⚡ Smart Task Auto-Priority** | Sistem otomatis menentukan tingkat urgensi tugas (`URGENT`, `HIGH`, `MEDIUM`, `LOW`) berdasarkan hitung mundur *deadline* (< 24 jam otomatis mendesak). |
| **📚 Manajemen Mata Kuliah & Jadwal** | Pengaturan SKS, dosen, ruang kelas, hari, jam, tag warna visual, dan filter per semester (1–8). |
| **📊 Dashboard Analitik Terpadu** | Kartu metrik KPI (Total SKS, % Penyelesaian Tugas, Tugas Terlambat, Agenda Hari Ini) dan banner peringatan *Overdue*. |
| **🎯 Kalkulator Nilai & Prediksi UAS** | Perhitungan nilai akhir berbobot kustom, konversi otomatis huruf mutu (skala 4.0), kalkulasi proyeksi IPK/IPS, serta simulator *"Berapa skor minimal UAS yang harus saya dapatkan untuk meraih target A?"*. |
| **🤖 Pengingat Otomatis Telegram Bot** | Terintegrasi dengan bot Telegram (`@studyflow_logicloop_bot`) untuk mengirim notifikasi tugas mendesak dan agenda kuliah setiap pagi. |
| **🔒 Keamanan & Stateless Auth** | Autentikasi sesi JWT stateless (`jose`), enkripsi sandi `bcryptjs` (salt 12), cookie *HTTP-Only*, dan proteksi rute middleware. |

---

## 🛠️ Tech Stack

* **Framework**: Next.js 16 (App Router) dengan Turbopack
* **Frontend UI**: React 19, Tailwind CSS v4, Lucide React Icons
* **Bahasa**: TypeScript 5 (Strict Mode)
* **Database & ORM**: Prisma ORM 6 dengan basis data SQLite lokal (`dev.db`), kompatibel penuh untuk cloud PostgreSQL (Supabase/Neon)
* **Keamanan**: Zod validation, Bcrypt.js, Jose JWT, HTTP-Only Cookie Session

---

## 🌿 Struktur Branch Repositori

Repositori ini menerapkan standar *Git Workflow* terstruktur:

* **`main`** : Branch produksi stabil (*Production Ready*).
* **`develop`** : Branch integrasi utama seluruh fitur dalam tahap pengembangan.
* **`dev`** : Branch aktif pengembangan lokal.
* **`feature`** : Branch template untuk penambahan modul atau fitur baru.
* **`fix`** : Branch template untuk perbaikan bug dan hotfix.

---

## 📂 Struktur Direktori Proyek

```text
poject_ logicloop/
├── .vscode/                 # Konfigurasi editor VS Code (JSON schema & linting)
├── package.json             # Root workspace script runner
├── README.md                # Dokumentasi utama repositori
└── studyflow/               # Sumber kode aplikasi utama Next.js 16
    ├── prisma/
    │   ├── schema.prisma    # Skema basis data & relasi
    │   ├── seed.js          # Skrip seeding data mahasiswa & mata kuliah demo
    │   └── dev.db           # SQLite database lokal
    ├── public/              # Aset statis & logo
    ├── src/
    │   ├── app/             # App Router (Pages & REST API Routes)
    │   │   ├── (auth)/      # Halaman Login & Register
    │   │   ├── (dashboard)/ # Halaman Dashboard, Courses, Tasks, Grades
    │   │   └── api/         # Endpoint REST API backend
    │   ├── components/      # Reusable UI & Layout Components
    │   ├── lib/             # Helper logika (Auth, Prisma, Telegram, Utils)
    │   └── middleware.ts    # Route guard & cookie validator
    └── package.json         # Dependensi frontend & backend
```

---

## 💻 Panduan Instalasi & Menjalankan Lokal

### 1. Kloning Repositori
```bash
git clone https://github.com/oliksupriadi-exe92/LogicLoop_Project_.git
cd LogicLoop_Project_
```

### 2. Pasang Dependensi
```bash
cd studyflow
npm install
```

### 3. Setup Basis Data & Seeding Data Awal
```bash
# Generate Prisma Client & buat tabel SQLite lokal
npx prisma db push

# Masukkan data demo mahasiswa, mata kuliah, dan tugas kuliah
node prisma/seed.js
```

### 4. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban di **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 Kredensial Akun Demo

Untuk mencoba langsung seluruh fitur tanpa registrasi manual:
* **Email**: `budi.santoso@mahasiswa.ac.id`
* **Password**: `Rahasia123!`

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
> Pengembangan StudyFlow dibagi secara terstruktur ke dalam tiga fokus utama:
> 1. **Frontend & UI/UX**: Merancang antarmuka responsif menggunakan Next.js 16 (App Router), Tailwind CSS v4, dan Lucide Icons untuk landing page interaktif, dashboard analitik, dan manajemen tugas.
> 2. **Backend & Database**: Mengembangkan skema database Prisma ORM, REST API, sistem autentikasi aman berbasis stateless JWT (`jose`), password hashing (`bcryptjs`), dan proteksi route guard.
> 3. **Logika Bisnis & Integrasi**: Mengimplementasikan algoritma auto-prioritas tugas berbasis sisa waktu, formula kalkulator prediksi nilai UAS, serta integrasi webhook notifikasi otomatis bot Telegram.

### Tantangan utama: (maks. 75 kata)
> Tantangan utama meliputi perancangan formula matematis prediktor nilai UAS yang harus fleksibel terhadap bobot dinamis komponen perkuliahan, penentuan auto-prioritas tugas secara akurat saat mendekati tenggat waktu, serta pengiriman notifikasi pengingat via Telegram Bot ke banyak mahasiswa secara personal tanpa menggunakan server worker eksternal berbayar. Selain itu, integrasi Next.js 16 dan Tailwind CSS v4 memerlukan penyesuaian konvensi arsitektur dan penanganan tipe TypeScript yang ketat.

### Solusi atas tantangan: (maks. 100 kata)
> Solusi yang diterapkan:
> 1. **Formula Invers Bobot**: Mengembangkan fungsi prediksi inversi linear yang memvalidasi batas kelayakan nilai (0–100) secara transparan.
> 2. **Algoritma Waktu Relatif**: Memanfaatkan fungsi utilitas kalkulasi selisih jam deadline untuk klasifikasi prioritas otomatis (*Urgent, High, Medium, Low*) tanpa beban komputasi berat.
> 3. **Penyimpanan Chat ID Personal**: Menyimpan Telegram Chat ID unik pada profil pengguna di database SQLite/PostgreSQL melalui Prisma, sehingga satu bot sentral dapat mendistribusikan notifikasi personal via REST endpoint.
> 4. **Konfigurasi Strict TypeScript**: Menerapkan validasi skema data Zod di seluruh rute API untuk menjamin kestabilan sistem.
