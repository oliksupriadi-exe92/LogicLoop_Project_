# 🎨 Google Stitch Design Specification — StudyFlow

Dokumen spesifikasi prototipe desain antarmuka visual dan sistem komponen UI aplikasi **StudyFlow** untuk **Google Stitch** (`stitch.withgoogle.com`).

---

## 1. Identitas Visual & Design Tokens

### Color Palette (Dark Mode High-Contrast)
* **Background Canvas**: `#090d16` (Deep Midnight Slate)
* **Surface / Card Background**: `#0f172a` (Slate 900) dengan border `rgba(255, 255, 255, 0.08)`
* **Primary / Accent**: `#10b981` (Emerald 500) & `#059669` (Emerald 600)
* **Secondary / Brand**: `#6366f1` (Indigo 500)
* **Text High-Contrast**: `#f8fafc` (Slate 50)
* **Text Muted**: `#94a3b8` (Slate 400)

### Status & Priority Urgency Badges
* 🚨 **URGENT (< 24 Jam / Overdue)**:
  * Background: `rgba(239, 68, 68, 0.15)`
  * Border: `rgba(239, 68, 68, 0.5)`
  * Text: `#ef4444` (Glow Red)
* 🔴 **HIGH (1 – 3 Hari)**:
  * Background: `rgba(245, 158, 11, 0.15)`
  * Border: `rgba(245, 158, 11, 0.5)`
  * Text: `#f59e0b` (Amber)
* 🟡 **MEDIUM (3 – 7 Hari)**:
  * Background: `rgba(59, 130, 246, 0.15)`
  * Border: `rgba(59, 130, 246, 0.5)`
  * Text: `#3b82f6` (Blue)
* 🟢 **LOW (> 7 Hari)**:
  * Background: `rgba(16, 185, 129, 0.15)`
  * Border: `rgba(16, 185, 129, 0.5)`
  * Text: `#10b981` (Emerald)

### Tipografi
* **Font Family**: `Inter, system-ui, -apple-system, sans-serif`
* **Headings**: SemiBold / Bold (H1: 32px, H2: 24px, H3: 18px)
* **Body / Meta**: 14px Regular / 12px Medium

---

## 2. Matriks Layar Prototipe (Screen Matrix)

### Screen 1: Unified Academic Dashboard (`/dashboard`)
* **Sidebar**: Logo StudyFlow, Navigasi (Dashboard, Jadwal Kuliah, Tugas Kuliah, Prediksi Nilai, Pengaturan), Profil Pengguna (Budi Santoso).
* **KPI Header Cards**:
  * Total SKS: `21 SKS`
  * Progress Tugas: `78%` (dengan bar gradient)
  * Tugas Overdue: `1 Mendesak`
  * Kuliah Hari Ini: `2 Kelas`
* **Widget Utama**:
  1. *Jadwal Kuliah Hari Ini*: Kartu waktu perkuliahan, kode ruangan, dan status waktu aktif.
  2. *Tugas Mendesak (Auto-Priority)*: Daftar tugas terdekat dengan badge kedaruratan.
  3. *Telegram Bot Widget*: Indikator status koneksi terhubung (`@studyflow_logicloop_bot`).

### Screen 2: Manajemen Tugas Cerdas (`/tasks`)
* **Header & Toolbar**: Tombol `+ Tambah Tugas Baru` dan kolom pencarian real-time.
* **Filter Bar**: `Semua (8)`, `Belum Selesai (5)`, `Selesai (3)`, dan `Terlambat (1)`.
* **Task Item Component**:
  * Checkbox toggle cepat.
  * Judul tugas & nama mata kuliah terkait.
  * Auto-Priority status badge (`URGENT`, `HIGH`, `MEDIUM`, `LOW`).
  * Hitung mundur waktu relatif (`Hari Ini, 23:59`, `2 Hari Lagi`).
  * Menu opsi titik tiga (Edit & Hapus).

### Screen 3: Kalkulator Nilai & Prediksi UAS (`/grades`)
* **Ringkasan Indeks Prestasi**: Kartu Proyeksi IPK (`3.82 / 4.00`) dengan visual radial progress ring.
* **Course Grade Card**:
  * Rincian komponen: Kehadiran (10%), Tugas Mandiri (20%), UTS (30%), UAS (40%).
* **What-If Simulation Box**:
  * Target Nilai Huruf: `A` (Ambang Batas 85.0).
  * Hasil Perhitungan Invers: `Dibutuhkan Nilai UAS Minimal: 81.5`.
  * Status Kelayakan: `Sangat Realistis (Achievable)`.

---

## 3. Komponen UI Reusable di Stitch (Design System Tokens)

```typescript
// Button Component Tokens
const ButtonVariants = {
  primary: "bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-900/30",
  secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
  danger: "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
};

// Card Surface Tokens
const CardSurface = "bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl";
```
