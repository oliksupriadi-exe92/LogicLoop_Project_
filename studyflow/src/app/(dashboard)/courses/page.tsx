"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Clock,
  MapPin,
  User,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getIndonesianDay } from "@/lib/utils";

interface Course {
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
  _count?: {
    tasks: number;
    gradeComponents: number;
  };
}

const COLOR_PRESETS = [
  { name: "Indigo", hex: "#6366f1" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Sky", hex: "#0ea5e9" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Rose", hex: "#f43f5e" },
];

export default function CoursesPage() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedSemester, setSelectedSemester] = React.useState<string>("ALL");

  // State Modal Form
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [editingCourseId, setEditingCourseId] = React.useState<string | null>(null);

  // Form Fields
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [lecturer, setLecturer] = React.useState("");
  const [credits, setCredits] = React.useState(3);
  const [semester, setSemester] = React.useState(1);
  const [dayOfWeek, setDayOfWeek] = React.useState(1);
  const [startTime, setStartTime] = React.useState("08:00");
  const [endTime, setEndTime] = React.useState("10:30");
  const [room, setRoom] = React.useState("");
  const [color, setColor] = React.useState("#6366f1");
  const [targetGrade, setTargetGrade] = React.useState("A");

  const refreshCourses = React.useCallback(async () => {
    try {
      const url =
        selectedSemester === "ALL"
          ? "/api/courses"
          : `/api/courses?semester=${selectedSemester}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setCourses(json.data || []);
      }
    } catch {
      // Handle error
    }
  }, [selectedSemester]);

  React.useEffect(() => {
    let ignore = false;
    const url =
      selectedSemester === "ALL"
        ? "/api/courses"
        : `/api/courses?semester=${selectedSemester}`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (!ignore && json.data) {
          setCourses(json.data);
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
  }, [selectedSemester]);

  const resetForm = () => {
    setName("");
    setCode("");
    setLecturer("");
    setCredits(3);
    setSemester(1);
    setDayOfWeek(1);
    setStartTime("08:00");
    setEndTime("10:30");
    setRoom("");
    setColor("#6366f1");
    setTargetGrade("A");
    setEditingCourseId(null);
    setErrorMessage(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Course) => {
    setEditingCourseId(c.id);
    setName(c.name);
    setCode(c.code || "");
    setLecturer(c.lecturer);
    setCredits(c.credits);
    setSemester(c.semester);
    setDayOfWeek(c.dayOfWeek);
    setStartTime(c.startTime);
    setEndTime(c.endTime);
    setRoom(c.room || "");
    setColor(c.color || "#6366f1");
    setTargetGrade(c.targetGrade || "A");
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      name,
      code: code || null,
      lecturer,
      credits: Number(credits),
      semester: Number(semester),
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      room: room || null,
      color,
      targetGrade,
    };

    try {
      const url = editingCourseId
        ? `/api/courses/${editingCourseId}`
        : "/api/courses";
      const method = editingCourseId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan data mata kuliah.");
      }

      setIsModalOpen(false);
      resetForm();
      refreshCourses();
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

  const handleDeleteCourse = async (id: string, courseName: string) => {
    if (!confirm(`Yakin ingin menghapus mata kuliah "${courseName}" beserta semua tugasnya?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (res.ok) {
        refreshCourses();
      } else {
        alert("Gagal menghapus mata kuliah.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
  };

  const handleFillDemoCourse = () => {
    const samples = [
      { name: "Algoritma & Pemrograman", code: "IF2101", lecturer: "Dr. Budi Gunawan, M.Kom", credits: 3, room: "Lab Komputer 3" },
      { name: "Basis Data Lanjut", code: "IF2204", lecturer: "Prof. Siti Aminah, Ph.D", credits: 4, room: "Ruang Teori B.201" },
      { name: "Rekayasa Perangkat Lunak", code: "IF3102", lecturer: "Ir. Hendra Wijaya, MT", credits: 3, room: "Auditorium Lantai 2" },
      { name: "Jaringan Komputer", code: "IF2105", lecturer: "Agus Pratama, M.T", credits: 3, room: "Lab Jaringan" },
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    setName(picked.name);
    setCode(picked.code);
    setLecturer(picked.lecturer);
    setCredits(picked.credits);
    setRoom(picked.room);
  };

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <BookOpen className="w-7 h-7 text-indigo-400" />
              <span>Mata Kuliah & Jadwal</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Kelola daftar mata kuliah, dosen pengampu, SKS, dan jadwal kelas mingguanmu.
            </p>
          </div>

          <Button onClick={handleOpenCreateModal} className="gap-2 self-start sm:self-auto shadow-indigo-500/25">
            <Plus className="w-4 h-4" />
            <span>Tambah Mata Kuliah</span>
          </Button>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card className="border-zinc-800 bg-zinc-900/60 p-4">
            <div className="text-[11px] text-zinc-400 font-medium">Total Mata Kuliah</div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-1">
              {courses.length} MK
            </div>
          </Card>
          <Card className="border-zinc-800 bg-zinc-900/60 p-4">
            <div className="text-[11px] text-zinc-400 font-medium">Total Beban SKS</div>
            <div className="text-xl sm:text-2xl font-bold text-indigo-400 mt-1">
              {totalCredits} SKS
            </div>
          </Card>
          <Card className="border-zinc-800 bg-zinc-900/60 p-4 col-span-2 sm:col-span-1">
            <div className="text-[11px] text-zinc-400 font-medium">Otomasi Bobot Nilai</div>
            <div className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Aktif 100% (4 Komponen)</span>
            </div>
          </Card>
        </div>

        {/* SEMESTER FILTER */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-semibold text-zinc-400 shrink-0">Filter Semester:</span>
          {["ALL", "1", "2", "3", "4", "5", "6", "7", "8"].map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedSemester === sem
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {sem === "ALL" ? "Semua Semester" : `Semester ${sem}`}
            </button>
          ))}
        </div>

        {/* COURSES GRID */}
        {isLoading ? (
          <div className="py-16 text-center text-xs text-zinc-500">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 animate-spin mx-auto mb-2" />
            Memuat mata kuliah...
          </div>
        ) : courses.length === 0 ? (
          <Card className="border-dashed border-zinc-800 bg-zinc-950/40 py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-zinc-200">Belum Ada Mata Kuliah</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-5">
              Tambahkan mata kuliah yang kamu ambil semester ini agar tugas dan kalkulasi IPK bisa
              berjalan otomatis.
            </p>
            <Button onClick={handleOpenCreateModal} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Tambah Mata Kuliah Pertama</span>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 transition-all shadow-lg relative overflow-hidden flex flex-col justify-between"
              >
                {/* COLOR ACCENT LINE */}
                <div
                  className="h-1.5 w-full absolute top-0 left-0"
                  style={{ backgroundColor: course.color || "#6366f1" }}
                />

                <div className="p-5 space-y-4">
                  {/* TITLE & CODE */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-white leading-snug">
                        {course.name}
                      </h3>
                      {course.code && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 mt-1 inline-block">
                          {course.code}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-800/40 shrink-0">
                      {course.credits} SKS
                    </span>
                  </div>

                  {/* LECTURER & ROOM */}
                  <div className="space-y-1.5 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{course.lecturer}</span>
                    </div>
                    {course.room && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate">{course.room}</span>
                      </div>
                    )}
                  </div>

                  {/* SCHEDULE & SEMESTER */}
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-zinc-300">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{getIndonesianDay(course.dayOfWeek)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-zinc-400 font-mono text-[11px]">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>
                        {course.startTime} - {course.endTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CARD FOOTER ACTIONS */}
                <div className="px-5 py-3 bg-zinc-950/60 border-t border-zinc-800/60 flex items-center justify-between">
                  <Link href={`/tasks?courseId=${course.id}`}>
                    <span className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                      <span>{course._count?.tasks ?? 0} Tugas</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(course)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Edit Mata Kuliah"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id, course.name)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                      title="Hapus Mata Kuliah"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
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
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>{editingCourseId ? "Edit Mata Kuliah" : "Tambah Mata Kuliah Baru"}</span>
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Lengkapi rincian jadwal, SKS, dan dosen pengampu kuliah.
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Nama Mata Kuliah *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Algoritma & Pemrograman"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Kode MK</label>
                    <input
                      type="text"
                      placeholder="e.g. IF2101"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Dosen Pengampu *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama dosen beserta gelar"
                    value={lecturer}
                    onChange={(e) => setLecturer(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Bobot SKS *</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      required
                      value={credits}
                      onChange={(e) => setCredits(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white text-center font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Semester *</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      required
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white text-center font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Hari Kuliah *</label>
                    <select
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-2 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      <option value={1}>Senin</option>
                      <option value={2}>Selasa</option>
                      <option value={3}>Rabu</option>
                      <option value={4}>Kamis</option>
                      <option value={5}>Jumat</option>
                      <option value={6}>Sabtu</option>
                      <option value={7}>Minggu</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Jam Mulai *</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Jam Selesai *</label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Ruangan / Link</label>
                    <input
                      type="text"
                      placeholder="e.g. Lab Komputer / Zoom"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Target Nilai</label>
                    <select
                      value={targetGrade}
                      onChange={(e) => setTargetGrade(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="A">A (Sangat Memuaskan)</option>
                      <option value="A-">A- (Sangat Baik)</option>
                      <option value="B+">B+ (Lebih dari Baik)</option>
                      <option value="B">B (Baik)</option>
                    </select>
                  </div>
                </div>

                {/* COLOR PALETTE PICKER */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-medium text-zinc-400">Warna Tag Mata Kuliah</label>
                  <div className="flex gap-2">
                    {COLOR_PRESETS.map((p) => (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() => setColor(p.hex)}
                        className={`w-7 h-7 rounded-full transition-transform ${
                          color === p.hex ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-zinc-900" : "opacity-80"
                        }`}
                        style={{ backgroundColor: p.hex }}
                        title={p.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={handleFillDemoCourse}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Contoh Cepat (Demo Fill)</span>
                  </button>
                  <div className="flex items-center gap-2">
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
                      {editingCourseId ? "Simpan Perubahan" : "Simpan Mata Kuliah"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
