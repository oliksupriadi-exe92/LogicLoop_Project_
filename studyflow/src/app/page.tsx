"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Code2,
  ShieldCheck,
  Zap,
  Target,
  GraduationCap,
  LogIn,
  UserPlus,
  Database,
  BookOpen,
  LayoutDashboard,
  Calculator,
  Bot,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  predictRequiredExamScore,
} from "@/lib/utils";
import { Priority } from "@/types";

const TARGET_SCORE_MAP: Record<string, number> = {
  A: 85,
  "A-": 80,
  "B+": 75,
  B: 70,
};

export default function Home() {
  // ----------------------------------------------------
  // STATE UNTUK INTERACTIVE DEMO 1: AUTO-PRIORITAS
  // ----------------------------------------------------
  const [hoursFromNow, setHoursFromNow] = React.useState<number>(18);

  const computedPriority: Priority = React.useMemo(() => {
    if (hoursFromNow <= 24) return "URGENT";
    if (hoursFromNow <= 72) return "HIGH";
    if (hoursFromNow <= 168) return "MEDIUM";
    return "LOW";
  }, [hoursFromNow]);

  // ----------------------------------------------------
  // STATE UNTUK INTERACTIVE DEMO 2: PREDIKSI UAS MINIMAL
  // ----------------------------------------------------
  const [presenceScore, setPresenceScore] = React.useState<number>(100);
  const [assignmentScore, setAssignmentScore] = React.useState<number>(85);
  const [midtermScore, setMidtermScore] = React.useState<number>(80);
  const [targetLetter, setTargetLetter] = React.useState<string>("A");

  const predictionResult = React.useMemo(() => {
    const known = [
      { weight: 10, score: presenceScore },
      { weight: 20, score: assignmentScore },
      { weight: 30, score: midtermScore },
    ];
    const examWeight = 40; // UAS
    const targetScore = TARGET_SCORE_MAP[targetLetter] || 85;

    return predictRequiredExamScore(known, examWeight, targetScore);
  }, [presenceScore, assignmentScore, midtermScore, targetLetter]);

  // Active Schema Tab
  const [activeSchemaTab, setActiveSchemaTab] = React.useState<
    "User" | "Course" | "Task" | "GradeComponent" | "Reminder"
  >("Course");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-zinc-950 to-slate-950 text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* GLOW DECORATIONS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/10 blur-[130px] pointer-events-none" />

      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/70 border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                StudyFlow
              </span>
              <span className="ml-2 text-[10px] uppercase font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Semua Fase Aktif (v1.0)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-zinc-300 hover:text-white">
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar Akun</span>
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="text-xs gap-1.5 shadow-indigo-500/20 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Buka Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 space-y-16">
        <section className="text-center space-y-6 pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/70 border border-zinc-700/60 text-xs font-medium text-zinc-300 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Platform Otomasi Kuliah Cerdas Terpadu</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Kendalikan Kuliah, Tugas, dan IPK dengan{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Otomasi Pintar
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            StudyFlow mengotomasi manajemen mata kuliah, prioritas tugas berdasarkan kedekatan
            deadline, prediksi nilai UAS minimum, dan reminder jadwal kuliah otomatis.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 shadow-indigo-500/25">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                Buka Portal Mahasiswa (Dashboard)
              </Button>
            </Link>
            <a href="#interactive-demo">
              <Button variant="secondary" size="lg" className="gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Coba Simulator Otomasi
              </Button>
            </a>
          </div>

          {/* QUICK STATS / TECH HIGHLIGHT */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="text-xs text-zinc-400 flex items-center gap-1.5 mb-1">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" /> Framework
              </div>
              <div className="text-sm font-semibold text-zinc-200">Next.js 16 App Router</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="text-xs text-zinc-400 flex items-center gap-1.5 mb-1">
                <Database className="w-3.5 h-3.5 text-violet-400" /> Database & ORM
              </div>
              <div className="text-sm font-semibold text-zinc-200">Prisma ORM (SQLite/PG)</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="text-xs text-zinc-400 flex items-center gap-1.5 mb-1">
                <Bot className="w-3.5 h-3.5 text-emerald-400" /> Bot Reminder
              </div>
              <div className="text-sm font-semibold text-zinc-200">Telegram Bot Real-Time</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="text-xs text-zinc-400 flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Otomasi & Prediksi
              </div>
              <div className="text-sm font-semibold text-zinc-200">What-If & Auto-Priority</div>
            </div>
          </div>
        </section>

        {/* SECTION: INTERACTIVE AUTOMATION DEMO */}
        <section id="interactive-demo" className="space-y-8 scroll-mt-20">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              <Zap className="w-6 h-6 text-amber-400" />
              Live Interactive Simulator: Formula Otomasi
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto">
              Fitur kalkulasi cerdas yang telah tertanam di `src/lib/utils.ts` dan siap dipakai di
              seluruh modul.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* SIMULATOR 1: AUTO PRIORITAS TUGAS */}
            <Card className="border-zinc-800 bg-zinc-900/70 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Clock className="w-5 h-5" />
                  </div>
                  <Badge priority={computedPriority} />
                </div>
                <CardTitle className="mt-3">Otomasi 1: Auto-Prioritas Tugas</CardTitle>
                <CardDescription>
                  Sistem otomatis mengklasifikasikan urgensi tugas tanpa mahasiswa perlu mengira-ngira.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Uji Waktu Deadline:</span>
                    <span className="font-semibold text-indigo-400">
                      {hoursFromNow} jam dari sekarang (
                      {hoursFromNow < 24
                        ? `${hoursFromNow} jam lagi`
                        : `${Math.round(hoursFromNow / 24)} hari lagi`}
                      )
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="240"
                    value={hoursFromNow}
                    onChange={(e) => setHoursFromNow(Number(e.target.value))}
                    className="w-full accent-indigo-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                    <span>1 jam (Hari-H)</span>
                    <span>3 hari (72h)</span>
                    <span>7 hari (168h)</span>
                    <span>10 hari</span>
                  </div>
                </div>

                {/* RESULT PREVIEW BOX */}
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                  <div className="text-xs text-zinc-400">Hasil Kalkulasi Algoritma:</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-zinc-200">
                        {hoursFromNow < 24
                          ? `Tenggat dalam ${hoursFromNow} jam ke depan`
                          : `Tenggat dalam ${Math.round(hoursFromNow / 24)} hari ke depan`}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {computedPriority === "URGENT" && "🚨 Kurang dari 24 jam! Segera selesaikan!"}
                        {computedPriority === "HIGH" && "⚠️ 1 - 3 hari lagi, letakkan di urutan atas."}
                        {computedPriority === "MEDIUM" && "⏳ 3 - 7 hari lagi, mulai dicicil."}
                        {computedPriority === "LOW" && "☕ Lebih dari seminggu, masih santai."}
                      </div>
                    </div>
                    <Badge priority={computedPriority} className="text-xs px-3 py-1 font-bold" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SIMULATOR 2: PREDIKSI UAS MINIMAL */}
            <Card className="border-zinc-800 bg-zinc-900/70 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Target className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-950/70 text-purple-300 border border-purple-800/50">
                    Bobot UAS: 40%
                  </span>
                </div>
                <CardTitle className="mt-3">Otomasi 2: Prediksi Nilai UAS Minimal</CardTitle>
                <CardDescription>
                  Ketahui persis berapa nilai UAS yang wajib didapat demi mengamankan nilai target.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">
                      Presensi (10%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={presenceScore}
                      onChange={(e) => setPresenceScore(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-sm text-center font-semibold text-zinc-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">
                      Tugas (20%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={assignmentScore}
                      onChange={(e) => setAssignmentScore(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-sm text-center font-semibold text-zinc-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">
                      UTS (30%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={midtermScore}
                      onChange={(e) => setMidtermScore(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-sm text-center font-semibold text-zinc-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Pilih Target Nilai Akhir:</label>
                  <div className="flex gap-2">
                    {["A", "A-", "B+", "B"].map((letter) => (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => setTargetLetter(letter)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          targetLetter === letter
                            ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                        }`}
                      >
                        {letter} ({TARGET_SCORE_MAP[letter]}+)
                      </button>
                    ))}
                  </div>
                </div>

                {/* RESULT PREDICTION CARD */}
                <div
                  className={`p-4 rounded-xl border ${
                    predictionResult.isAchievable
                      ? "bg-purple-950/20 border-purple-800/40"
                      : "bg-rose-950/20 border-rose-800/40"
                  } space-y-1.5`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Nilai UAS Minimal Dibutuhkan:</span>
                    <span
                      className={`text-xl font-extrabold ${
                        predictionResult.isAchievable ? "text-purple-400" : "text-rose-400"
                      }`}
                    >
                      {predictionResult.requiredScore}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {predictionResult.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SECTION: DATABASE SCHEMA & ERD VIEWER */}
        <section id="database-schema" className="space-y-6 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                <Layers className="w-6 h-6 text-indigo-400" />
                Skema Database Terintegrasi (Prisma ORM)
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Relasi lengkap User, Course, Task, GradeComponent, dan Reminder dengan optimasi indeks.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
              {(["User", "Course", "Task", "GradeComponent", "Reminder"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSchemaTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeSchemaTab === tab
                        ? "bg-indigo-600 text-white shadow"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
          </div>

          {/* SCHEMA CONTENT DISPLAY */}
          <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur-md overflow-hidden">
            <div className="p-6">
              {activeSchemaTab === "User" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white">Model: User (Tabel `users`)</h3>
                      <p className="text-xs text-zinc-400">
                        Menyimpan profil mahasiswa, password hash (bcrypt), dan preferensi notifikasi.
                      </p>
                    </div>
                    <Badge variant="info">Primary Table</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="text-zinc-400 border-b border-zinc-800">
                        <tr>
                          <th className="py-2">Field</th>
                          <th className="py-2">Type</th>
                          <th className="py-2">Keterangan / Atribut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                        <tr>
                          <td className="py-2.5 font-semibold text-indigo-400">id</td>
                          <td>String (UUID)</td>
                          <td>@id @default(uuid())</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-zinc-200">name</td>
                          <td>String</td>
                          <td>Nama lengkap mahasiswa</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-amber-400">email</td>
                          <td>String</td>
                          <td>@unique, Terindeks untuk pencarian cepat</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-zinc-200">password</td>
                          <td>String</td>
                          <td>Password terenkripsi bcrypt</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-zinc-400">courses</td>
                          <td>Course[]</td>
                          <td>Relasi 1-to-many ke Course</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-zinc-400">tasks</td>
                          <td>Task[]</td>
                          <td>Relasi 1-to-many ke Task</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-zinc-400">reminders</td>
                          <td>Reminder[]</td>
                          <td>Relasi 1-to-many ke Reminder</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSchemaTab === "Course" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white">Model: Course (Tabel `courses`)</h3>
                      <p className="text-xs text-zinc-400">
                        Menyimpan jadwal mata kuliah, SKS, dosen, semester, dan target nilai.
                      </p>
                    </div>
                    <Badge variant="success">Academic Core</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="text-zinc-400 border-b border-zinc-800">
                        <tr>
                          <th className="py-2">Field</th>
                          <th className="py-2">Type</th>
                          <th className="py-2">Keterangan / Atribut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                        <tr>
                          <td className="py-2.5 font-semibold text-indigo-400">id</td>
                          <td>String (UUID)</td>
                          <td>@id @default(uuid())</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-zinc-200">userId</td>
                          <td>String</td>
                          <td>Foreign Key -&gt; User.id (onDelete: Cascade)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-zinc-200">name</td>
                          <td>String</td>
                          <td>Nama Mata Kuliah (contoh: Algoritma & Pemrograman)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-zinc-200">credits</td>
                          <td>Int</td>
                          <td>Bobot SKS (e.g., 3 SKS)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-zinc-200">semester</td>
                          <td>Int</td>
                          <td>Semester kuliah (@@index([userId, semester]))</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-zinc-200">dayOfWeek</td>
                          <td>Int</td>
                          <td>1 (Senin) s.d. 7 (Minggu)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-zinc-200">startTime, endTime</td>
                          <td>String</td>
                          <td>Format &quot;HH:mm&quot; (contoh: &quot;08:00&quot;, &quot;10:30&quot;)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSchemaTab === "Task" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white">Model: Task (Tabel `tasks`)</h3>
                      <p className="text-xs text-zinc-400">
                        Daftar tugas, deadline, auto-prioritas, status pengerjaan, dan relasi ke mata kuliah.
                      </p>
                    </div>
                    <Badge variant="warning">Task Engine</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="text-zinc-400 border-b border-zinc-800">
                        <tr>
                          <th className="py-2">Field</th>
                          <th className="py-2">Type</th>
                          <th className="py-2">Keterangan / Atribut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                        <tr>
                          <td className="py-2.5 font-semibold text-indigo-400">id</td>
                          <td>String (UUID)</td>
                          <td>@id @default(uuid())</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-zinc-200">courseId</td>
                          <td>String</td>
                          <td>Foreign Key -&gt; Course.id</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-zinc-200">title, description</td>
                          <td>String, Text?</td>
                          <td>Judul & panduan pengerjaan tugas</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-amber-400">deadline</td>
                          <td>DateTime</td>
                          <td>Tenggat waktu (Terindeks @@index([deadline]))</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-rose-400">priority</td>
                          <td>Enum Priority</td>
                          <td>LOW, MEDIUM, HIGH, URGENT</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-emerald-400">status</td>
                          <td>Enum TaskStatus</td>
                          <td>TODO, IN_PROGRESS, COMPLETED</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSchemaTab === "GradeComponent" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Model: GradeComponent (Tabel `grade_components`)
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Komponen nilai per mata kuliah (Presensi 10%, Tugas 20%, UTS 30%, UAS 40%).
                      </p>
                    </div>
                    <Badge variant="info">Grade Engine</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="text-zinc-400 border-b border-zinc-800">
                        <tr>
                          <th className="py-2">Field</th>
                          <th className="py-2">Type</th>
                          <th className="py-2">Keterangan / Atribut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                        <tr>
                          <td className="py-2.5 font-semibold text-indigo-400">id</td>
                          <td>String (UUID)</td>
                          <td>@id @default(uuid())</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-zinc-200">courseId</td>
                          <td>String</td>
                          <td>Foreign Key -&gt; Course.id (Cascade)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-zinc-200">name</td>
                          <td>String</td>
                          <td>Presensi, Tugas Mandiri, UTS, UAS, atau custom</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-violet-400">weight</td>
                          <td>Float</td>
                          <td>Persentase bobot (misal 20.0%)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-emerald-400">score</td>
                          <td>Float?</td>
                          <td>Nilai aktual mahasiswa (0-100), null jika belum ada</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSchemaTab === "Reminder" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Model: Reminder (Tabel `reminders`)
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Jadwal pengingat otomatis: H-3, H-1, dan hari-H via Email / Telegram.
                      </p>
                    </div>
                    <Badge variant="warning">Scheduler Ready</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="text-zinc-400 border-b border-zinc-800">
                        <tr>
                          <th className="py-2">Field</th>
                          <th className="py-2">Type</th>
                          <th className="py-2">Keterangan / Atribut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                        <tr>
                          <td className="py-2.5 font-semibold text-indigo-400">id</td>
                          <td>String (UUID)</td>
                          <td>@id @default(uuid())</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-zinc-200">userId, taskId</td>
                          <td>String, String?</td>
                          <td>Terkoneksi ke mahasiswa dan tugas yang dituju</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-indigo-400">type</td>
                          <td>Enum ReminderType</td>
                          <td>EMAIL, TELEGRAM, SYSTEM</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-amber-400">timing</td>
                          <td>Enum Timing</td>
                          <td>D_MINUS_3 (H-3), D_MINUS_1 (H-1), D_DAY (Hari-H)</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-zinc-200">remindAt</td>
                          <td>DateTime</td>
                          <td>Waktu eksekusi notifikasi (Terindeks @@index([remindAt, isSent]))</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-semibold text-emerald-400">isSent</td>
                          <td>Boolean</td>
                          <td>Default: false</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* SECTION: 7-PHASE ROADMAP */}
        <section className="space-y-6 pt-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Status Pengembangan: 100% Selesai &amp; Teruji</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              Roadmap Pengembangan StudyFlow (7 Fase Selesai)
            </h2>
            <p className="text-sm text-zinc-400 max-w-2xl mx-auto">
              Seluruh fase fitur telah selesai diimplementasikan secara terpadu, mulai dari arsitektur database, keamanan, analitik, prediksi nilai, hingga bot pengingat Telegram.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* FASE 1 */}
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-emerald-500/40 relative shadow-lg shadow-emerald-500/5 hover:border-emerald-500/70 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Fase 1 (Selesai)
                  </span>
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Database className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="font-bold text-base text-white">Struktur &amp; Skema Database</h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Prisma ORM, SQLite/PostgreSQL, relasi model User, Course, Task, Grade, dan Reminder dengan skema Zod ketat serta utility formula matematika dan tanggal teruji.
                </p>
              </div>
              <div className="pt-4 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-500">Arsitektur Dasar</span>
                <a href="#database-schema" className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1">
                  Lihat Skema <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* FASE 2 */}
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-emerald-500/40 relative shadow-lg shadow-emerald-500/5 hover:border-emerald-500/70 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Fase 2 (Selesai)
                  </span>
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="font-bold text-base text-white">Autentikasi &amp; Keamanan</h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Register, Login, hashing password bcrypt, HTTP-only JWT session cookie, middleware proteksi rute, dan rate limiting brute-force protection.
                </p>
              </div>
              <div className="pt-4 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-500">Multi-User Ready</span>
                <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1">
                  Coba Login <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* FASE 3 */}
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-emerald-500/40 relative shadow-lg shadow-emerald-500/5 hover:border-emerald-500/70 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Fase 3 (Selesai)
                  </span>
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <BookOpen className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="font-bold text-base text-white">CRUD Mata Kuliah &amp; Tugas</h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Manajemen SKS, dosen, jadwal, ruangan, filter status tugas, pencarian instan, dan algoritma auto-prioritas urgensi deadline (Urgent, High, Medium, Low).
                </p>
              </div>
              <div className="pt-4 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-500">Modul Akademik</span>
                <div className="flex items-center gap-2">
                  <Link href="/courses" className="text-zinc-400 hover:text-white font-medium">
                    Mata Kuliah
                  </Link>
                  <span className="text-zinc-600">&bull;</span>
                  <Link href="/tasks" className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1">
                    Buka Tugas <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* FASE 4 */}
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-emerald-500/40 relative shadow-lg shadow-emerald-500/5 hover:border-emerald-500/70 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Fase 4 (Selesai)
                  </span>
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <LayoutDashboard className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="font-bold text-base text-white">Dashboard Mahasiswa Terpadu</h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  4 KPI Cards (IPK, Total SKS, Tugas Aktif, Selesai), widget jadwal kuliah hari ini, deteksi otomatis tugas terlambat (overdue alerts), dan ringkasan per mata kuliah.
                </p>
              </div>
              <div className="pt-4 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-500">Pusat Informasi</span>
                <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1">
                  Buka Dashboard <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* FASE 5 */}
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-emerald-500/40 relative shadow-lg shadow-emerald-500/5 hover:border-emerald-500/70 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Fase 5 (Selesai)
                  </span>
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Calculator className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="font-bold text-base text-white">Kalkulator Nilai &amp; Prediksi UAS</h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Perhitungan otomatis nilai akhir berbobot (Presensi 10%, Tugas 20%, UTS 30%, UAS 40%), konversi huruf mutu (A s/d E), dan What-If Simulation prediksi nilai UAS minimal.
                </p>
              </div>
              <div className="pt-4 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-500">Simulasi IPK</span>
                <Link href="/grades" className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1">
                  Coba Kalkulator <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* FASE 6 & 7 */}
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-emerald-500/40 relative shadow-lg shadow-emerald-500/5 hover:border-emerald-500/70 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Fase 6 &amp; 7 (Selesai)
                  </span>
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Bot className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="font-bold text-base text-white">Bot Telegram &amp; Cloud Ready</h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Bot Telegram (@studyflow_logicloop_bot) aktif untuk pengingat tugas deadline &lt; 24 jam, input Chat ID mandiri di profil dashboard, dan panduan deploy cloud lengkap.
                </p>
              </div>
              <div className="pt-4 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-500">Notifikasi Realtime</span>
                <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1">
                  Atur Telegram <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-zinc-800/80 bg-zinc-950/60 py-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-400">StudyFlow</span>
            <span>&bull;</span>
            <span>Aplikasi Otomasi Kuliah Mahasiswa</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400/90 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Semua 7 Fase Selesai &bull; Siap Dipresentasikan &amp; Dideploy ke Cloud</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
