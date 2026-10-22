# 🚀 LogicLoop Project Workspace

Selamat datang di repositori kolaborasi **LogicLoop Project** (Branch: `develop`).

Workspace ini menaungi aplikasi utama **StudyFlow** beserta standardisasi alur kerja agen cerdas (**Antigravity Agentic Pipeline**).

---

## 📁 Struktur Workspace

```text
LogicLoop_Project_/
├── .agents/                 # Custom Agent Skills (Stitch, UI/UX, Design, Audit)
│   └── skills/              # 25+ modul automasi skill Antigravity
├── studyflow/               # Aplikasi Web Full-Stack StudyFlow (Next.js 16 + Prisma)
│   ├── src/                 # Source code frontend & backend API
│   ├── prisma/              # Schema ORM, migrasi, & seeder database
│   └── README.md            # Dokumentasi lengkap modul & fitur StudyFlow
├── AGENTS.md                # Master Workspace & Engineering Rules (Anti-AI Slop)
├── PIPELINE.md              # Rincian 7 Fase End-to-End Pipeline & HITL Checkpoints
├── skills-lock.json         # Lockfile dependensi skill agent
└── package.json             # Root workspace runner scripts
```

---

## ⚡ Quick Start

### 1. Menjalankan Aplikasi StudyFlow
Dari root direktori, jalankan:

```bash
# Menjalankan dev server StudyFlow (Next.js 16)
npm run dev
```
Aplikasi dapat diakses di **http://localhost:3000**.

Untuk detail konfigurasi database SQLite / Prisma dan akun demo, lihat [Dokumentasi Lengkap StudyFlow](studyflow/README.md).

---

## 🤖 Standar & Aturan Agen (AGENTS.MD)

Semua kontribusi kode dan otomasi agent di branch ini wajib mematuhi aturan di **[AGENTS.md](AGENTS.md)**:
- **Strict TypeScript**: Bebas `any` atau `@ts-ignore`.
- **Anti-AI Slop**: Mematuhi aturan desain visual 60-30-10, tipografi tunggal, dan hierarki bobot.
- **Human-in-the-Loop (HITL) Checkpoints**: Menjaga gerbang validasi sebelum generasi atau modifikasi kode produksi.

Panduan lengkap alur kerja desain & integrasi Stitch AI dapat dibaca di **[PIPELINE.md](PIPELINE.md)**.
