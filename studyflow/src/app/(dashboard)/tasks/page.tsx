"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckSquare,
  Plus,
  Search,
  Clock,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  BookOpen,
  Zap,
  Columns3,
  List,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateAutoPriority, getRelativeDeadline, formatIndonesianDateTime } from "@/lib/utils";
import { Priority, TaskStatus } from "@/types";

interface CourseOption {
  id: string;
  name: string;
  code?: string | null;
  color?: string | null;
}

interface Task {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  deadline: string;
  priority: Priority;
  status: TaskStatus;
  completedAt?: string | null;
  course: {
    id: string;
    name: string;
    code?: string | null;
    color?: string | null;
  };
}

function TasksContent() {
  const searchParams = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "ALL";

  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [courses, setCourses] = React.useState<CourseOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // View Mode: List vs Kanban Board
  const [viewMode, setViewMode] = React.useState<"list" | "kanban">("list");

  // Filter States
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCourse, setSelectedCourse] = React.useState<string>(initialCourseId);
  const [selectedStatus, setSelectedStatus] = React.useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = React.useState<string>("ALL");

  // Modal States
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);

  // Form Fields
  const [courseId, setCourseId] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [deadline, setDeadline] = React.useState("");
  const [priority, setPriority] = React.useState<Priority>("MEDIUM");
  const [status, setStatus] = React.useState<TaskStatus>("TODO");

  // Hitung Auto-Prioritas real-time saat user memilih tanggal deadline
  const autoCalculatedPriority = React.useMemo(() => {
    if (!deadline) return "MEDIUM";
    return calculateAutoPriority(new Date(deadline));
  }, [deadline]);

  // Initial load courses
  React.useEffect(() => {
    let ignore = false;
    fetch("/api/courses")
      .then((res) => res.json())
      .then((json) => {
        if (!ignore && json.data) {
          setCourses(json.data);
        }
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  // Filtered tasks fetch
  React.useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams();
    if (selectedCourse !== "ALL") params.set("courseId", selectedCourse);
    if (selectedStatus !== "ALL") params.set("status", selectedStatus);
    if (selectedPriority !== "ALL") params.set("priority", selectedPriority);
    if (searchQuery) params.set("search", searchQuery);

    fetch(`/api/tasks?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (!ignore && json.data) {
          setTasks(json.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [selectedCourse, selectedStatus, selectedPriority, searchQuery]);

  const refreshTasks = React.useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCourse !== "ALL") params.set("courseId", selectedCourse);
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (selectedPriority !== "ALL") params.set("priority", selectedPriority);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setTasks(json.data || []);
      }
    } catch {
      // Handle error
    }
  }, [selectedCourse, selectedStatus, selectedPriority, searchQuery]);

  const resetForm = () => {
    setCourseId(courses[0]?.id || "");
    setTitle("");
    setDescription("");
    // Default deadline 3 hari ke depan jam 23:59
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 3);
    defaultDate.setHours(23, 59, 0, 0);
    setDeadline(defaultDate.toISOString().slice(0, 16));
    setPriority("MEDIUM");
    setStatus("TODO");
    setEditingTaskId(null);
    setErrorMessage(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    if (courses.length > 0) {
      setCourseId(courses[0].id);
    }
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: Task) => {
    setEditingTaskId(t.id);
    setCourseId(t.courseId);
    setTitle(t.title);
    setDescription(t.description || "");
    setDeadline(new Date(t.deadline).toISOString().slice(0, 16));
    setPriority(t.priority);
    setStatus(t.status);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      courseId,
      title,
      description: description || null,
      deadline: new Date(deadline).toISOString(),
      priority,
      status,
    };

    try {
      const url = editingTaskId ? `/api/tasks/${editingTaskId}` : "/api/tasks";
      const method = editingTaskId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan tugas.");
      }

      setIsModalOpen(false);
      resetForm();
      refreshTasks();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Terjadi kesalahan sistem.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatus: TaskStatus =
      task.status === "COMPLETED" ? "TODO" : "COMPLETED";

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      refreshTasks();
    } catch {
      refreshTasks();
    }
  };

  const handleSetStatus = async (task: Task, nextStatus: TaskStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      refreshTasks();
    } catch {
      refreshTasks();
    }
  };

  const handleDeleteTask = async (id: string, taskTitle: string) => {
    if (!confirm(`Hapus tugas "${taskTitle}"?`)) return;

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        refreshTasks();
      }
    } catch {
      alert("Gagal menghapus tugas.");
    }
  };

  // Stats calculation
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status !== "COMPLETED").length;
  const urgentTasks = tasks.filter(
    (t) => t.status !== "COMPLETED" && t.priority === "URGENT"
  ).length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <CheckSquare className="w-7 h-7 text-indigo-400" />
            <span>Manajemen Tugas Kuliah</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Kelola tugas dengan auto-prioritas cerdas, filter status, dan pelacakan deadline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* VIEW SWITCHER */}
          <div className="flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Daftar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "kanban"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <Button
            onClick={handleOpenCreateModal}
            disabled={courses.length === 0}
            className="gap-2 shadow-indigo-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tugas Baru</span>
          </Button>
        </div>
      </div>

      {/* STATS TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-zinc-800 bg-zinc-900/60 p-4">
          <div className="text-[11px] text-zinc-400 font-medium">Total Tugas</div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">{totalTasks}</div>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/60 p-4">
          <div className="text-[11px] text-zinc-400 font-medium">Perlu Dikerjakan</div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">{pendingTasks}</div>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/60 p-4">
          <div className="text-[11px] text-zinc-400 font-medium">Mendesak (&lt; 24h)</div>
          <div className="text-xl sm:text-2xl font-bold text-rose-400 mt-1">{urgentTasks}</div>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/60 p-4">
          <div className="text-[11px] text-zinc-400 font-medium">Selesai</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">{completedTasks}</div>
        </Card>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <Card className="border-zinc-800 bg-zinc-900/80 p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* SEARCH INPUT */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Cari tugas berdasarkan judul atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* COURSE FILTER DROPDOWN */}
          <div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-semibold"
            >
              <option value="ALL">Semua Mata Kuliah</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.code ? `(${c.code})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* STATUS & PRIORITY FILTER PILLS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
          {/* STATUS PILLS */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-semibold text-zinc-500 mr-1">Status:</span>
            {[
              { label: "Semua", val: "ALL" },
              { label: "Belum", val: "TODO" },
              { label: "Diproses", val: "IN_PROGRESS" },
              { label: "Selesai", val: "COMPLETED" },
            ].map((st) => (
              <button
                key={st.val}
                onClick={() => setSelectedStatus(st.val)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedStatus === st.val
                    ? "bg-indigo-600 text-white shadow"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* PRIORITY PILLS */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-semibold text-zinc-500 mr-1">Prioritas:</span>
            {[
              { label: "Semua", val: "ALL" },
              { label: "Mendesak", val: "URGENT" },
              { label: "Tinggi", val: "HIGH" },
              { label: "Sedang", val: "MEDIUM" },
              { label: "Rendah", val: "LOW" },
            ].map((pr) => (
              <button
                key={pr.val}
                onClick={() => setSelectedPriority(pr.val)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedPriority === pr.val
                    ? "bg-zinc-700 text-white shadow"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {pr.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* TASKS LIST */}
      {courses.length === 0 ? (
        <Card className="border-dashed border-zinc-800 bg-zinc-950/40 py-14 text-center">
          <BookOpen className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-zinc-200">Tambahkan Mata Kuliah Terlebih Dahulu</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
            Tugas harus dikaitkan dengan mata kuliah tertentu.
          </p>
          <Link href="/courses">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Buka Menu Mata Kuliah</span>
            </Button>
          </Link>
        </Card>
      ) : isLoading ? (
        <div className="py-16 text-center text-xs text-zinc-500">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 animate-spin mx-auto mb-2" />
          Memuat daftar tugas...
        </div>
      ) : tasks.length === 0 ? (
        <Card className="border-dashed border-zinc-800 bg-zinc-950/40 py-14 text-center">
          <CheckSquare className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-zinc-200">Tidak Ada Tugas Ditemukan</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
            Tidak ada tugas yang sesuai dengan filter pencarian kamu.
          </p>
          <Button onClick={handleOpenCreateModal} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Tambah Tugas Baru</span>
          </Button>
        </Card>
      ) : viewMode === "list" ? (
        <div className="space-y-3">
          {tasks.map((task) => {
            const relDeadline = getRelativeDeadline(task.deadline);
            const isDone = task.status === "COMPLETED";

            return (
              <div
                key={task.id}
                className={`group p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone
                    ? "bg-zinc-950/40 border-zinc-900 opacity-60"
                    : "bg-zinc-900/80 border-zinc-800/90 hover:border-zinc-700 shadow-sm"
                }`}
              >
                {/* LEFT: CHECKBOX & INFO */}
                <div className="flex items-start gap-3.5">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(task)}
                    className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                      isDone
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "border-zinc-700 bg-zinc-950 hover:border-indigo-500"
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white shrink-0"
                        style={{ backgroundColor: task.course.color || "#6366f1" }}
                      >
                        {task.course.name}
                      </span>
                      <h4
                        className={`text-sm font-bold text-white transition-all ${
                          isDone ? "line-through text-zinc-500" : ""
                        }`}
                      >
                        {task.title}
                      </h4>
                    </div>

                    {task.description && (
                      <p className="text-xs text-zinc-400 line-clamp-2 max-w-xl">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                      {/* RELATIVE DEADLINE */}
                      <span
                        className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                          relDeadline.isOverdue
                            ? "text-rose-400"
                            : relDeadline.hoursRemaining <= 24
                            ? "text-amber-400"
                            : "text-zinc-400"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{relDeadline.text}</span>
                        <span className="text-zinc-600 font-normal">
                          ({formatIndonesianDateTime(task.deadline)})
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT: BADGES & ACTIONS */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <Badge priority={task.priority} />
                    <Badge status={task.status} />
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditModal(task)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                      title="Edit Tugas"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id, task.title)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                      title="Hapus Tugas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {/* KOLOM 1: TODO */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="font-bold text-sm text-zinc-200">Belum Dikerjakan</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold">
                {tasks.filter((t) => t.status === "TODO").length}
              </span>
            </div>

            <div className="space-y-3 min-h-[160px]">
              {tasks.filter((t) => t.status === "TODO").length === 0 ? (
                <div className="py-10 text-center text-xs text-zinc-500 border border-dashed border-zinc-800/60 rounded-xl">
                  Tidak ada tugas belum dikerjakan
                </div>
              ) : (
                tasks
                  .filter((t) => t.status === "TODO")
                  .map((task) => {
                    const relDeadline = getRelativeDeadline(task.deadline);
                    return (
                      <div
                        key={task.id}
                        className="bg-zinc-950/80 border border-zinc-800/90 hover:border-zinc-700 rounded-xl p-3.5 space-y-3 shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                            style={{ backgroundColor: task.course.color || "#6366f1" }}
                          >
                            {task.course.name}
                          </span>
                          <Badge priority={task.priority} />
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white line-clamp-2">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span
                            className={`font-medium text-[11px] ${
                              relDeadline.isOverdue
                                ? "text-rose-400"
                                : relDeadline.hoursRemaining <= 24
                                ? "text-amber-400"
                                : "text-zinc-400"
                            }`}
                          >
                            {relDeadline.text}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-900 gap-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditModal(task)}
                              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id, task.title)}
                              className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                              title="Hapus"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSetStatus(task, "IN_PROGRESS")}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all border border-indigo-500/30"
                            title="Mulai kerjakan tugas ini"
                          >
                            <span>Mulai</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* KOLOM 2: IN_PROGRESS */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="font-bold text-sm text-zinc-200">Sedang Dikerjakan</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 font-semibold border border-amber-800/40">
                {tasks.filter((t) => t.status === "IN_PROGRESS").length}
              </span>
            </div>

            <div className="space-y-3 min-h-[160px]">
              {tasks.filter((t) => t.status === "IN_PROGRESS").length === 0 ? (
                <div className="py-10 text-center text-xs text-zinc-500 border border-dashed border-zinc-800/60 rounded-xl">
                  Tidak ada tugas sedang dikerjakan
                </div>
              ) : (
                tasks
                  .filter((t) => t.status === "IN_PROGRESS")
                  .map((task) => {
                    const relDeadline = getRelativeDeadline(task.deadline);
                    return (
                      <div
                        key={task.id}
                        className="bg-zinc-950/80 border border-amber-900/40 hover:border-amber-700/60 rounded-xl p-3.5 space-y-3 shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                            style={{ backgroundColor: task.course.color || "#6366f1" }}
                          >
                            {task.course.name}
                          </span>
                          <Badge priority={task.priority} />
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white line-clamp-2">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span
                            className={`font-medium text-[11px] ${
                              relDeadline.isOverdue
                                ? "text-rose-400"
                                : relDeadline.hoursRemaining <= 24
                                ? "text-amber-400"
                                : "text-zinc-400"
                            }`}
                          >
                            {relDeadline.text}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-900 gap-2">
                          <button
                            type="button"
                            onClick={() => handleSetStatus(task, "TODO")}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-zinc-800"
                            title="Kembalikan ke Todo"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span>Todo</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(task)}
                              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStatus(task, "COMPLETED")}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-500/30"
                              title="Tandai selesai"
                            >
                              <span>Selesai</span>
                              <CheckCircle2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* KOLOM 3: COMPLETED */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h3 className="font-bold text-sm text-zinc-200">Selesai</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 font-semibold border border-emerald-800/40">
                {tasks.filter((t) => t.status === "COMPLETED").length}
              </span>
            </div>

            <div className="space-y-3 min-h-[160px]">
              {tasks.filter((t) => t.status === "COMPLETED").length === 0 ? (
                <div className="py-10 text-center text-xs text-zinc-500 border border-dashed border-zinc-800/60 rounded-xl">
                  Belum ada tugas selesai
                </div>
              ) : (
                tasks
                  .filter((t) => t.status === "COMPLETED")
                  .map((task) => {
                    return (
                      <div
                        key={task.id}
                        className="bg-zinc-950/50 border border-zinc-900 opacity-75 hover:opacity-100 rounded-xl p-3.5 space-y-3 shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                            style={{ backgroundColor: task.course.color || "#6366f1" }}
                          >
                            {task.course.name}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-800/40">
                            <CheckCircle2 className="w-3 h-3" />
                            Selesai
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-zinc-400 line-through">
                            {task.title}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-900 gap-2">
                          <button
                            type="button"
                            onClick={() => handleSetStatus(task, "TODO")}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-zinc-800"
                            title="Buka kembali tugas ini"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span>Buka Kembali</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteTask(task.id, task.title)}
                              className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                              title="Hapus"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-lg border-zinc-800 bg-zinc-900 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <CardHeader className="border-b border-zinc-800 pb-4">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-400" />
                <span>{editingTaskId ? "Edit Tugas Kuliah" : "Tambah Tugas Baru"}</span>
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Pilih mata kuliah dan tentukan batas waktu pengumpulan tugas.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* SELECT COURSE */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Pilih Mata Kuliah *</label>
                  <select
                    required
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.code ? `(${c.code})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TITLE */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Judul Tugas *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Makalah Studi Kasus Normalisasi Database"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">
                    Instruksi / Catatan Tugas (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Rincian panduan, link drive tugas, atau format pengumpulan..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* DEADLINE INPUT */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Deadline Pengumpulan *</label>
                  <input
                    type="datetime-local"
                    required
                    value={deadline}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDeadline(val);
                      // Otomatis sinkronkan prioritas dengan kedekatan deadline
                      setPriority(calculateAutoPriority(new Date(val)));
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* AUTO-PRIORITY PREVIEW INDICATOR */}
                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-[11px] text-zinc-400">Otomasi Prioritas Cerdas:</div>
                      <div className="text-xs font-bold text-zinc-200">
                        Sistem mendeteksi tingkat urgensi:
                      </div>
                    </div>
                  </div>
                  <Badge priority={autoCalculatedPriority} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* MANUAL PRIORITY OVERRIDE */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Ubah Prioritas Manual</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="URGENT">Mendesak (&lt; 24 jam)</option>
                      <option value="HIGH">Tinggi (1 - 3 hari)</option>
                      <option value="MEDIUM">Sedang (3 - 7 hari)</option>
                      <option value="LOW">Rendah (&gt; 7 hari)</option>
                    </select>
                  </div>

                  {/* STATUS */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Status Tugas</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as TaskStatus)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="TODO">Belum Dikerjakan</option>
                      <option value="IN_PROGRESS">Sedang Diproses</option>
                      <option value="COMPLETED">Selesai</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs text-zinc-400"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={isSubmitting}
                    className="text-xs shadow-indigo-500/20"
                  >
                    {editingTaskId ? "Simpan Perubahan" : "Simpan Tugas"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <AppShell>
      <React.Suspense
        fallback={
          <div className="py-16 text-center text-xs text-zinc-500">
            Memuat halaman tugas...
          </div>
        }
      >
        <TasksContent />
      </React.Suspense>
    </AppShell>
  );
}
