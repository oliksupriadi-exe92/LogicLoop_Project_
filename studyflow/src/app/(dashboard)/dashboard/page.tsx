"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Calendar,
  CheckSquare,
  Layers,
  MapPin,
  User,
  Zap,
  Check,
  Plus,
  Send,
  Bell,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getIndonesianDay,
  formatIndonesianDateTime,
  getRelativeDeadline,
} from "@/lib/utils";
import { Priority, TaskStatus } from "@/types";

interface CourseInfo {
  id: string;
  name: string;
  code?: string | null;
  lecturer: string;
  credits: number;
  semester: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string | null;
  color?: string | null;
  targetGrade?: string | null;
}

interface TaskItem {
  id: string;
  title: string;
  deadline: string;
  priority: Priority;
  status: TaskStatus;
  course: {
    id: string;
    name: string;
    code?: string | null;
    color?: string | null;
  };
}

interface CourseSummary {
  id: string;
  name: string;
  code?: string | null;
  lecturer: string;
  credits: number;
  semester: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string | null;
  color?: string | null;
  targetGrade?: string | null;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  progressPercentage: number;
}

interface DashboardData {
  student: {
    id: string;
    name: string;
    email: string;
    role: string;
    telegramChatId?: string | null;
  };
  stats: {
    totalCourses: number;
    totalCredits: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasksCount: number;
    urgentTasksCount: number;
    completionRate: number;
    todayLecturesCount: number;
    currentDayOfWeek: number;
  };
  todaySchedule: CourseInfo[];
  overdueTasks: TaskItem[];
  upcomingTasks: TaskItem[];
  recentCompletedTasks: TaskItem[];
  courseSummaries: CourseSummary[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSendingTelegram, setIsSendingTelegram] = React.useState(false);
  const [telegramFeedback, setTelegramFeedback] = React.useState<string | null>(null);

  // Edit Chat ID State
  const [isEditingChatId, setIsEditingChatId] = React.useState(false);
  const [inputChatId, setInputChatId] = React.useState("");
  const [isSavingChatId, setIsSavingChatId] = React.useState(false);

  const handleSaveTelegramChatId = async () => {
    setIsSavingChatId(true);
    setTelegramFeedback(null);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramChatId: inputChatId }),
      });
      const json = await res.json();
      if (res.ok) {
        setTelegramFeedback("Chat ID Telegram berhasil disimpan!");
        setIsEditingChatId(false);
        const refreshed = await fetch("/api/dashboard").then((r) => r.json());
        if (refreshed.data) setData(refreshed.data);
      } else {
        setTelegramFeedback(json.error || "Gagal menyimpan Chat ID.");
      }
    } catch {
      setTelegramFeedback("Terjadi kesalahan jaringan.");
    } finally {
      setIsSavingChatId(false);
      setTimeout(() => setTelegramFeedback(null), 4000);
    }
  };

  const handleTriggerTelegram = async () => {
    setIsSendingTelegram(true);
    setTelegramFeedback(null);
    try {
      const res = await fetch("/api/reminders/trigger", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setTelegramFeedback(json.message || "Notifikasi berhasil dikirim!");
      } else {
        setTelegramFeedback(json.error || "Gagal mengirim notifikasi.");
      }
    } catch {
      setTelegramFeedback("Terjadi kesalahan jaringan.");
    } finally {
      setIsSendingTelegram(false);
      setTimeout(() => setTelegramFeedback(null), 5000);
    }
  };

  // Load Dashboard Data
  React.useEffect(() => {
    let ignore = false;

    fetch("/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((json) => {
        if (!ignore && json.data) {
          setData(json.data);
          setInputChatId(json.data.student.telegramChatId || "");
        }
      })
      .catch(() => {
        if (!ignore) {
          router.push("/login");
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [router]);

  // Quick Toggle Status from Dashboard
  const handleToggleTask = async (task: TaskItem) => {
    if (!data) return;
    const nextStatus: TaskStatus =
      task.status === "COMPLETED" ? "TODO" : "COMPLETED";

    // Optimistic UI Update
    setData((prev) => {
      if (!prev) return prev;
      const isNowCompleted = nextStatus === "COMPLETED";

      const updatedUpcoming = prev.upcomingTasks.filter((t) => t.id !== task.id);
      const updatedOverdue = prev.overdueTasks.filter((t) => t.id !== task.id);

      return {
        ...prev,
        stats: {
          ...prev.stats,
          completedTasks: isNowCompleted
            ? prev.stats.completedTasks + 1
            : Math.max(0, prev.stats.completedTasks - 1),
          pendingTasks: isNowCompleted
            ? Math.max(0, prev.stats.pendingTasks - 1)
            : prev.stats.pendingTasks + 1,
          overdueTasksCount: task.deadline && new Date(task.deadline).getTime() < Date.now() && isNowCompleted
            ? Math.max(0, prev.stats.overdueTasksCount - 1)
            : prev.stats.overdueTasksCount,
          completionRate:
            prev.stats.totalTasks > 0
              ? Math.round(
                  ((prev.stats.completedTasks + (isNowCompleted ? 1 : -1)) /
                    prev.stats.totalTasks) *
                    100
                )
              : 100,
        },
        upcomingTasks: updatedUpcoming,
        overdueTasks: updatedOverdue,
      };
    });

    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      // Silent refresh
      const refreshed = await fetch("/api/dashboard").then((r) => r.json());
      if (refreshed.data) {
        setData(refreshed.data);
      }
    } catch {
      // Abaikan jika ada error ringan
    }
  };

  if (isLoading || !data) {
    return (
      <AppShell>
        <div className="py-24 text-center text-xs text-zinc-500">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 animate-spin mx-auto mb-3" />
          Memuat ringkasan analitik akademik kamu...
        </div>
      </AppShell>
    );
  }

  const { student, stats, todaySchedule, overdueTasks, upcomingTasks, courseSummaries } =
    data;

  // Format tanggal saat ini dalam bahasa Indonesia
  const currentDateFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <AppShell>
      <div className="space-y-8 pb-10">
        {/* ========================================================= */}
        {/* HERO / WELCOME BANNER                                     */}
        {/* ========================================================= */}
        <section className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-zinc-900 border border-indigo-900/40 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentDateFormatted}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Selamat Datang, {student.name}! 🎓
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Kelola perkuliahan dengan tenang. Pantau tugas kuliah dengan auto-prioritas cerdas,
                cek jadwal hari ini, dan capai target IPK semester ini.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link href="/tasks">
                <Button size="sm" className="gap-2 shadow-lg shadow-indigo-600/30">
                  <Plus className="w-4 h-4" />
                  <span>Tambah Tugas</span>
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="sm" variant="secondary" className="gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Kelola Mata Kuliah</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TOP KPI STATS GRID                                        */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* SKS TOTAL */}
          <Link href="/courses" className="block group">
            <Card className="border-zinc-800 bg-zinc-900/70 group-hover:border-zinc-700 transition-all shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-zinc-400">Beban SKS Aktif</CardTitle>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-white">
                  {stats.totalCredits} <span className="text-sm font-semibold text-zinc-400">SKS</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 flex items-center justify-between">
                  <span>{stats.totalCourses} Mata Kuliah</span>
                  <span className="text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Lihat <ArrowRight className="w-3 h-3" />
                  </span>
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* TINGKAT PENYELESAIAN TUGAS */}
          <Link href="/tasks" className="block group">
            <Card className="border-zinc-800 bg-zinc-900/70 group-hover:border-zinc-700 transition-all shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-zinc-400">Progress Tugas</CardTitle>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-extrabold text-emerald-400">
                    {stats.completionRate}%
                  </div>
                  <span className="text-xs text-zinc-400">
                    {stats.completedTasks} / {stats.totalTasks} Selesai
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* TUGAS TERLAMBAT (OVERDUE ALERT) */}
          <Link href="/tasks?status=TODO" className="block group">
            <Card
              className={`transition-all shadow-md ${
                stats.overdueTasksCount > 0
                  ? "border-rose-900/60 bg-rose-950/20 group-hover:border-rose-700"
                  : "border-zinc-800 bg-zinc-900/70 group-hover:border-zinc-700"
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-zinc-400">Tugas Terlambat</CardTitle>
                <div
                  className={`p-2 rounded-xl border transition-transform group-hover:scale-110 ${
                    stats.overdueTasksCount > 0
                      ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                      : "bg-zinc-800/80 text-zinc-400 border-zinc-700/50"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-extrabold ${
                    stats.overdueTasksCount > 0 ? "text-rose-400" : "text-zinc-200"
                  }`}
                >
                  {stats.overdueTasksCount}{" "}
                  <span className="text-sm font-semibold text-zinc-400">Tugas</span>
                </div>
                <p className="text-[11px] mt-1">
                  {stats.overdueTasksCount > 0 ? (
                    <span className="text-rose-400 font-medium">Perlu segera diselesaikan!</span>
                  ) : (
                    <span className="text-zinc-500">Semua tugas aman terkendali</span>
                  )}
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* JADWAL KULIAH HARI INI */}
          <Link href="/courses" className="block group">
            <Card className="border-zinc-800 bg-zinc-900/70 group-hover:border-zinc-700 transition-all shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-zinc-400">Kuliah Hari Ini</CardTitle>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-purple-400">
                  {stats.todayLecturesCount}{" "}
                  <span className="text-sm font-semibold text-zinc-400">Sesi</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  {stats.todayLecturesCount > 0
                    ? `Jadwal hari ${getIndonesianDay(stats.currentDayOfWeek)}`
                    : "Hari bebas kuliah (libur)"}
                </p>
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* ========================================================= */}
        {/* MAIN TWO-COLUMN DASHBOARD WORKSPACE                       */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ======================================================= */}
          {/* LEFT COLUMN: SCHEDULE & ACTIVE TASKS (8 COLS)          */}
          {/* ======================================================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. JADWAL KULIAH HARI INI */}
            <Card className="border-zinc-800 bg-zinc-900/80 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-zinc-800/80 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <span>Jadwal Kuliah Hari Ini ({getIndonesianDay(stats.currentDayOfWeek)})</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Sesi perkuliahan yang aktif sesuai kalender akademik kamu
                    </CardDescription>
                  </div>
                  <Link href="/courses">
                    <Button variant="ghost" size="sm" className="text-xs gap-1 text-zinc-400 hover:text-white">
                      <span>Semua Jadwal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {todaySchedule.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500 space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mx-auto text-zinc-400">
                      <Calendar className="w-5 h-5 text-indigo-400" />
                    </div>
                    <p className="font-medium text-zinc-300">
                      Tidak ada jadwal kuliah untuk hari ini ({getIndonesianDay(stats.currentDayOfWeek)}).
                    </p>
                    <p className="text-zinc-500 max-w-sm mx-auto">
                      Gunakan waktu luang ini untuk menyelesaikan tugas mandiri atau persiapan ujian.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {todaySchedule.map((course) => (
                      <div
                        key={course.id}
                        className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 relative overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-colors"
                      >
                        <div
                          className="w-1.5 h-full absolute left-0 top-0"
                          style={{ backgroundColor: course.color || "#6366f1" }}
                        />
                        <div className="pl-2 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-sm text-white">{course.name}</h4>
                              {course.code && (
                                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 inline-block mt-0.5">
                                  {course.code}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-800/40 shrink-0">
                              {course.credits} SKS
                            </span>
                          </div>

                          <div className="space-y-1 text-xs text-zinc-400 pt-1">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="font-mono text-zinc-300">
                                {course.startTime} - {course.endTime}
                              </span>
                            </div>
                            {course.room && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                <span className="truncate">{course.room}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                              <span className="truncate">{course.lecturer}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. PERINGATAN TUGAS TERLAMBAT (OVERDUE TASKS ALERT) */}
            {overdueTasks.length > 0 && (
              <Card className="border-rose-900/70 bg-rose-950/20 shadow-2xl overflow-hidden">
                <CardHeader className="bg-rose-950/40 border-b border-rose-900/50 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-rose-300 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Perhatian: {overdueTasks.length} Tugas Melewati Tenggat Waktu</span>
                    </CardTitle>
                    <Badge variant="danger">Prioritas Darurat</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-2.5">
                  {overdueTasks.map((task) => {
                    const relative = getRelativeDeadline(task.deadline);
                    return (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl bg-zinc-950/80 border border-rose-900/40 flex items-center justify-between gap-3 hover:border-rose-700/60 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            onClick={() => handleToggleTask(task)}
                            className="w-5 h-5 rounded-md border border-zinc-700 hover:border-emerald-500 flex items-center justify-center shrink-0 transition-colors group"
                            title="Tandai Selesai"
                          >
                            <Check className="w-3.5 h-3.5 text-transparent group-hover:text-emerald-400" />
                          </button>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{task.title}</h4>
                            <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: task.course.color || "#6366f1" }}
                              />
                              <span className="truncate">{task.course.name}</span>
                              <span className="text-rose-400 font-semibold">• {relative.text}</span>
                            </div>
                          </div>
                        </div>

                        <Link href="/tasks">
                          <Button size="sm" variant="danger" className="text-xs h-7 px-2.5 shrink-0">
                            Kerjakan
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* 3. TUGAS TERDEKAT (UPCOMING DEADLINES & AUTO-PRIORITY) */}
            <Card className="border-zinc-800 bg-zinc-900/80 shadow-xl">
              <CardHeader className="border-b border-zinc-800/80 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Tugas Mendatang & Auto-Prioritas</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Tugas kuliah terdekat yang diurutkan otomatis berdasarkan tenggat waktu
                    </CardDescription>
                  </div>
                  <Link href="/tasks">
                    <Button variant="ghost" size="sm" className="text-xs gap-1 text-zinc-400 hover:text-white">
                      <span>Kelola Semua Tugas</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5">
                {upcomingTasks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500 space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mx-auto text-zinc-400">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="font-medium text-zinc-300">Semua tugas beres!</p>
                    <p className="text-zinc-500">Tidak ada tugas mendesak yang menunggu saat ini.</p>
                    <Link href="/tasks" className="inline-block pt-1">
                      <Button size="sm" variant="outline" className="text-xs gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Tambah Tugas Baru
                      </Button>
                    </Link>
                  </div>
                ) : (
                  upcomingTasks.map((task) => {
                    const relative = getRelativeDeadline(task.deadline);
                    const isUrgent = task.priority === "URGENT" || relative.hoursRemaining <= 24;

                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-2xl bg-zinc-950/70 border transition-all flex items-center justify-between gap-3 ${
                          isUrgent
                            ? "border-rose-900/50 hover:border-rose-700/80"
                            : "border-zinc-800/80 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* QUICK CHECK TOGGLE */}
                          <button
                            onClick={() => handleToggleTask(task)}
                            className="w-5 h-5 rounded-md border border-zinc-700 hover:border-emerald-400 hover:bg-emerald-950/30 flex items-center justify-center shrink-0 transition-colors group"
                            title="Tandai Selesai"
                          >
                            <Check className="w-3.5 h-3.5 text-transparent group-hover:text-emerald-400" />
                          </button>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white truncate">{task.title}</h4>
                              {isUrgent && (
                                <span className="flex h-2 w-2 relative shrink-0">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400 mt-1">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: task.course.color || "#6366f1" }}
                              />
                              <span className="text-zinc-300 font-medium truncate max-w-[140px]">
                                {task.course.name}
                              </span>
                              <span className="text-zinc-600">•</span>
                              <span className="font-mono text-zinc-400">
                                {formatIndonesianDateTime(task.deadline)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* PRIORITY & RELATIVE BADGE */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                              isUrgent
                                ? "bg-rose-950/80 text-rose-300 border-rose-800/50"
                                : task.priority === "HIGH"
                                ? "bg-amber-950/80 text-amber-300 border-amber-800/50"
                                : "bg-zinc-800 text-zinc-300 border-zinc-700"
                            }`}
                          >
                            {relative.text}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* ======================================================= */}
          {/* RIGHT COLUMN: COURSE PROGRESS & AUTOMATION (4 COLS)     */}
          {/* ======================================================= */}
          <div className="lg:col-span-4 space-y-6">
            {/* 1. RINGKASAN PROGRESS PER MATA KULIAH */}
            <Card className="border-zinc-800 bg-zinc-900/80 shadow-xl">
              <CardHeader className="border-b border-zinc-800/80 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Progress Per Mata Kuliah</span>
                  </CardTitle>
                  <Link href="/courses">
                    <span className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium">
                      Detail
                    </span>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {courseSummaries.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-4">
                    Belum ada mata kuliah yang didaftarkan.
                  </p>
                ) : (
                  courseSummaries.map((c) => (
                    <Link
                      key={c.id}
                      href={`/tasks?courseId=${c.id}`}
                      className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 transition-all block group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: c.color || "#6366f1" }}
                          />
                          <h5 className="font-bold text-xs text-zinc-200 group-hover:text-white truncate">
                            {c.name}
                          </h5>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                          {c.credits} SKS
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                        <span>{c.completedTasks} dari {c.totalTasks} tugas</span>
                        <span className="font-bold text-zinc-300">{c.progressPercentage}%</span>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${c.progressPercentage}%`,
                            backgroundColor: c.color || "#6366f1",
                          }}
                        />
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            {/* 2. TELEGRAM BOT REMINDER WIDGET */}
            <Card className="border-indigo-900/60 bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-900 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-indigo-900/40 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-indigo-400" />
                    <span>Telegram Reminder Bot</span>
                  </CardTitle>
                  {student.telegramChatId ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Terhubung
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1">
                      Belum Terhubung
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Bot Telegram Resmi:</span>
                    <a
                      href="https://t.me/studyflow_logicloop_bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono font-semibold text-indigo-400 hover:underline"
                    >
                      @studyflow_logicloop_bot
                    </a>
                  </div>
                  {student.telegramChatId && !isEditingChatId && (
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Chat ID Anda:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-zinc-300">{student.telegramChatId}</span>
                        <button
                          onClick={() => {
                            setIsEditingChatId(true);
                            setInputChatId(student.telegramChatId || "");
                          }}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 underline"
                        >
                          Ubah
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {(!student.telegramChatId || isEditingChatId) && (
                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                    <div className="space-y-1 text-[11px] text-zinc-400">
                      <p className="font-semibold text-zinc-300">Hubungkan Telegram Teman / Mahasiswa:</p>
                      <ol className="list-decimal list-inside space-y-0.5">
                        <li>Buka bot <strong className="text-indigo-300">@studyflow_logicloop_bot</strong> & klik Start.</li>
                        <li>Cek Chat ID di bot <strong className="text-indigo-300">@userinfobot</strong>.</li>
                        <li>Masukkan angka Chat ID di bawah:</li>
                      </ol>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Contoh: 7455955755"
                        value={inputChatId}
                        onChange={(e) => setInputChatId(e.target.value)}
                        className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveTelegramChatId}
                        disabled={isSavingChatId || !inputChatId.trim()}
                        className="text-xs h-8"
                      >
                        {isSavingChatId ? "Menyimpan..." : "Simpan"}
                      </Button>
                      {isEditingChatId && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditingChatId(false)}
                          className="text-xs h-8 px-2"
                        >
                          Batal
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Bot otomatis mengirimkan pengingat jika ada tugas kuliah yang melewati batas waktu atau tersisa kurang dari 24 jam.
                </p>

                {telegramFeedback && (
                  <div className="p-2.5 rounded-xl bg-indigo-950/70 border border-indigo-800 text-[11px] text-indigo-200">
                    {telegramFeedback}
                  </div>
                )}

                {student.telegramChatId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleTriggerTelegram}
                    disabled={isSendingTelegram}
                    className="w-full text-xs gap-2 border-indigo-800/60 hover:bg-indigo-950/40 text-indigo-300"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>{isSendingTelegram ? "Mengirim ke Telegram..." : "Tes Kirim Pengingat ke HP / Laptop"}</span>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* 3. STATUS OTOMASI SISTEM (AKADEMIK AI) */}
            <Card className="border-zinc-800 bg-zinc-900/80 shadow-xl">
              <CardHeader className="border-b border-zinc-800/80 pb-3">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Fitur Otomasi Akademik</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-zinc-200">Auto-Prioritas Deadline</div>
                    <div className="text-[11px] text-zinc-400">
                      Tugas otomatis naik status ke Mendesak (&lt;24 jam) dan Tinggi (&lt;3 hari).
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-zinc-200">Bobot Komponen Nilai Otomatis</div>
                    <div className="text-[11px] text-zinc-400">
                      Presensi 10%, Tugas 20%, UTS 30%, UAS 40% otomatis terbuat per MK.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <CheckSquare className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-zinc-200">Sinkronisasi Database Persisten</div>
                    <div className="text-[11px] text-zinc-400">
                      Data tersimpan aman di SQLite lokal (dev.db) siap deploy ke PostgreSQL.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. PROFIL MAHASISWA */}
            <Card className="border-zinc-800 bg-zinc-900/80 shadow-xl">
              <CardContent className="p-4 space-y-2 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-zinc-200 truncate">{student.name}</div>
                    <div className="text-[11px] text-zinc-400 truncate">{student.email}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
