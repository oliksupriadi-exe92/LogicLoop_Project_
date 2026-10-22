"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calculator,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Plus,
  Trash2,
  RefreshCw,
  Sliders,
  Save,
  Check,
  AlertCircle,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GradeComponentData {
  id?: string;
  name: string;
  weight: number;
  score: number | null;
}

interface CourseGradeData {
  id: string;
  name: string;
  code?: string | null;
  lecturer: string;
  credits: number;
  semester: number;
  color?: string | null;
  targetGrade: string;
  targetMinScore: number;
  currentScore: number;
  currentGradeInfo: {
    letter: string;
    point: number;
    label: string;
  };
  targetGradeInfo: {
    letter: string;
    point: number;
    label: string;
  };
  totalWeight: number;
  completedWeight: number;
  remainingWeight: number;
  components: GradeComponentData[];
  prediction: {
    requiredScore: number;
    isAchievable: boolean;
    message: string;
  } | null;
}

interface GradesSummary {
  totalCourses: number;
  totalCredits: number;
  currentGpa: number;
  projectedGpa: number;
  achievableCoursesCount: number;
}

export default function GradesPage() {
  const [courses, setCourses] = React.useState<CourseGradeData[]>([]);
  const [summary, setSummary] = React.useState<GradesSummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Modal / Editor State
  const [editingCourse, setEditingCourse] = React.useState<CourseGradeData | null>(null);
  const [editedTargetGrade, setEditedTargetGrade] = React.useState("A");
  const [editedComponents, setEditedComponents] = React.useState<GradeComponentData[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);

  // What-If Simulator State
  const [selectedCourseForSim, setSelectedCourseForSim] = React.useState<string>("");
  const [simulatedUasScore, setSimulatedUasScore] = React.useState<number>(85);

  // Fetch grades data
  const refreshGrades = React.useCallback(async () => {
    try {
      const res = await fetch("/api/grades");
      if (res.ok) {
        const json = await res.json();
        setCourses(json.data.courses || []);
        setSummary(json.data.summary || null);
        if (json.data.courses?.length > 0 && !selectedCourseForSim) {
          setSelectedCourseForSim(json.data.courses[0].id);
        }
      }
    } catch {
      // Handle error
    }
  }, [selectedCourseForSim]);

  React.useEffect(() => {
    let ignore = false;
    fetch("/api/grades")
      .then((res) => res.json())
      .then((json) => {
        if (!ignore && json.data) {
          setCourses(json.data.courses || []);
          setSummary(json.data.summary || null);
          if (json.data.courses?.length > 0) {
            setSelectedCourseForSim(json.data.courses[0].id);
          }
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
  }, []);

  // Open Edit Modal
  const handleOpenEdit = (course: CourseGradeData) => {
    setEditingCourse(course);
    setEditedTargetGrade(course.targetGrade || "A");
    setEditedComponents(
      course.components.map((c) => ({
        id: c.id,
        name: c.name,
        weight: c.weight,
        score: c.score,
      }))
    );
    setFormError(null);
  };

  // Close Edit Modal
  const handleCloseEdit = () => {
    setEditingCourse(null);
    setFormError(null);
  };

  // Modify Component in Editor
  const handleComponentChange = (
    index: number,
    field: "name" | "weight" | "score",
    value: string | number | null
  ) => {
    setEditedComponents((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Add Component
  const handleAddComponent = () => {
    setEditedComponents((prev) => [
      ...prev,
      { name: "Komponen Baru", weight: 10, score: null },
    ]);
  };

  // Remove Component
  const handleRemoveComponent = (index: number) => {
    if (editedComponents.length <= 1) {
      setFormError("Minimal harus ada 1 komponen nilai.");
      return;
    }
    setEditedComponents((prev) => prev.filter((_, i) => i !== index));
  };

  // Reset to Default Weights (10%, 20%, 30%, 40%)
  const handleResetToDefaultWeights = () => {
    setEditedComponents([
      { name: "Presensi", weight: 10, score: 95 },
      { name: "Tugas Mandiri", weight: 20, score: 85 },
      { name: "UTS", weight: 30, score: 80 },
      { name: "UAS", weight: 40, score: null },
    ]);
    setFormError(null);
  };

  // Save Components & Target
  const handleSaveGrades = async () => {
    if (!editingCourse) return;

    // Hitung total bobot
    const totalWeight = editedComponents.reduce(
      (sum, c) => sum + (Number(c.weight) || 0),
      0
    );

    if (Math.abs(totalWeight - 100) > 0.01) {
      setFormError(
        `Total bobot komponen saat ini adalah ${totalWeight}%. Bobot harus berjumlah tepat 100%.`
      );
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        targetGrade: editedTargetGrade,
        components: editedComponents.map((c) => ({
          id: c.id,
          name: c.name,
          weight: Number(c.weight),
          score: c.score !== null && c.score !== undefined && c.score !== ("" as unknown)
            ? Number(c.score)
            : null,
        })),
      };

      const res = await fetch(`/api/grades/${editingCourse.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menyimpan komponen nilai.");
      }

      setFeedbackMessage("Komponen nilai dan target berhasil diperbarui!");
      setTimeout(() => setFeedbackMessage(null), 3000);
      handleCloseEdit();
      refreshGrades();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Terjadi kesalahan sistem saat menyimpan.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kalkulasi Live Simulator
  const activeSimCourse = courses.find((c) => c.id === selectedCourseForSim);
  const simulatedOutcome = React.useMemo(() => {
    if (!activeSimCourse) return null;

    // Komponen yang sudah ada skor selain UAS/komponen terakhir
    const comps = activeSimCourse.components;
    const scoredNonExam = comps.filter((c) => c.score !== null);
    const unscored = comps.filter((c) => c.score === null);
    const examWeight = unscored.reduce((sum, c) => sum + c.weight, 0);

    const baseScore = scoredNonExam.reduce(
      (acc, c) => acc + ((c.score ?? 0) * c.weight) / 100,
      0
    );

    const examContribution = (simulatedUasScore * (examWeight || 40)) / 100;
    const finalSimScore = Math.round((baseScore + examContribution) * 10) / 10;

    let letter = "E";
    let point = 0.0;
    if (finalSimScore >= 85) {
      letter = "A";
      point = 4.0;
    } else if (finalSimScore >= 80) {
      letter = "A-";
      point = 3.75;
    } else if (finalSimScore >= 75) {
      letter = "B+";
      point = 3.5;
    } else if (finalSimScore >= 70) {
      letter = "B";
      point = 3.0;
    } else if (finalSimScore >= 65) {
      letter = "B-";
      point = 2.75;
    } else if (finalSimScore >= 60) {
      letter = "C+";
      point = 2.5;
    } else if (finalSimScore >= 55) {
      letter = "C";
      point = 2.0;
    } else if (finalSimScore >= 45) {
      letter = "D";
      point = 1.0;
    }

    return {
      finalScore: finalSimScore,
      letter,
      point,
      examWeight: examWeight || 40,
    };
  }, [activeSimCourse, simulatedUasScore]);

  // Total bobot saat mengedit
  const currentEditTotalWeight = editedComponents.reduce(
    (sum, c) => sum + (Number(c.weight) || 0),
    0
  );

  if (isLoading) {
    return (
      <AppShell>
        <div className="py-24 text-center text-xs text-zinc-500">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 animate-spin mx-auto mb-3" />
          Memuat kalkulator nilai & prediksi UAS mahasiswa...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* ========================================================= */}
        {/* HEADER                                                    */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <Calculator className="w-7 h-7 text-indigo-400" />
              <span>Kalkulator Nilai & Prediksi UAS</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
              Hitung bobot nilai perkuliahan secara otomatis dan ketahui nilai minimal yang dibutuhkan
              pada ujian akhir untuk mengunci target huruf mutu impian kamu.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {feedbackMessage && (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-xl animate-fade-in flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{feedbackMessage}</span>
              </span>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* TOP 4 KPI CARDS (PROYEKSI IPK & STATISTIK)               */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. PROYEKSI IPK TARGET */}
          <Card className="border-indigo-900/40 bg-gradient-to-br from-indigo-950/40 to-zinc-900 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-indigo-300">
                Proyeksi IPK Target
              </CardTitle>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Award className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-indigo-300">
                {summary?.projectedGpa?.toFixed(2) ?? "4.00"}{" "}
                <span className="text-xs font-semibold text-zinc-400">/ 4.00</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Jika semua target nilai huruf tercapai
              </p>
            </CardContent>
          </Card>

          {/* 2. IPK BERJALAN SAAT INI */}
          <Card className="border-zinc-800 bg-zinc-900/70 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400">
                IPK Berjalan Saat Ini
              </CardTitle>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-emerald-400">
                {summary?.currentGpa?.toFixed(2) ?? "0.00"}{" "}
                <span className="text-xs font-semibold text-zinc-400">/ 4.00</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Dihitung dari komponen nilai yang sudah masuk
              </p>
            </CardContent>
          </Card>

          {/* 3. TOTAL SKS TERHITUNG */}
          <Card className="border-zinc-800 bg-zinc-900/70 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400">
                Total SKS Terhitung
              </CardTitle>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <BookOpen className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">
                {summary?.totalCredits ?? 0}{" "}
                <span className="text-sm font-semibold text-zinc-400">SKS</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Beban akademik semester ini ({summary?.totalCourses ?? 0} MK)
              </p>
            </CardContent>
          </Card>

          {/* 4. TARGET NILAI AMAN */}
          <Card className="border-zinc-800 bg-zinc-900/70 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400">
                Status Target Aman
              </CardTitle>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-amber-400">
                {summary?.achievableCoursesCount ?? 0}{" "}
                <span className="text-sm font-semibold text-zinc-400">
                  / {summary?.totalCourses ?? 0} MK
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Target nilai realistis dapat diraih
              </p>
            </CardContent>
          </Card>
        </section>

        {/* ========================================================= */}
        {/* INTERACTIVE WHAT-IF SIMULATOR PLAYGROUND                  */}
        {/* ========================================================= */}
        <section className="p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-indigo-950/30 to-zinc-900 border border-indigo-900/40 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-2">
                <Sliders className="w-3.5 h-3.5" />
                <span>Simulasi Real-Time &quot;What-If&quot;</span>
              </div>
              <h2 className="text-lg font-bold text-white">
                Bagaimana Jika Nilai UAS Kamu Mendapat Skor Tertentu?
              </h2>
              <p className="text-xs text-zinc-400">
                Geser nilai simulasi untuk langsung melihat perubahan total nilai akhir dan huruf mutu.
              </p>
            </div>

            {/* PICK COURSE FOR SIMULATION */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-400">Pilih MK:</label>
              <select
                value={selectedCourseForSim}
                onChange={(e) => setSelectedCourseForSim(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.credits} SKS)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeSimCourse && simulatedOutcome && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-5 items-center">
              {/* SLIDER CONTROLLER */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">
                    Simulasi Nilai Ujian Akhir (Bobot: {simulatedOutcome.examWeight}%)
                  </span>
                  <span className="text-lg font-black font-mono text-indigo-400 bg-indigo-950/80 px-3 py-0.5 rounded-lg border border-indigo-800/40">
                    {simulatedUasScore}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={simulatedUasScore}
                  onChange={(e) => setSimulatedUasScore(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />

                <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                  <span>0 (Gagal)</span>
                  <span>55 (C)</span>
                  <span>70 (B)</span>
                  <span>85 (A)</span>
                  <span>100 (Sempurna)</span>
                </div>
              </div>

              {/* SIMULATED RESULT CARD */}
              <div className="md:col-span-5 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-400">Hasil Simulasi Nilai Akhir</span>
                  <div className="text-2xl font-black text-white mt-0.5">
                    {simulatedOutcome.finalScore}{" "}
                    <span className="text-sm font-semibold text-zinc-500">/ 100</span>
                  </div>
                  <span className="text-xs text-zinc-400">
                    Bobot IP: {simulatedOutcome.point.toFixed(2)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-zinc-400">Huruf Mutu</span>
                  <div className="text-3xl font-black text-indigo-400">
                    {simulatedOutcome.letter}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold block">
                    {simulatedOutcome.letter === "A" || simulatedOutcome.letter === "A-"
                      ? "Target Lulus Sangat Baik"
                      : "Lulus Standar"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* COURSES GRADE CARDS LIST                                  */}
        {/* ========================================================= */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>Rincian Bobot & Prediksi Per Mata Kuliah</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Atur bobot kustom per mata kuliah dan perbarui nilai komponen saat nilai sudah diumumkan.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
              {courses.length} Mata Kuliah Aktif
            </span>
          </div>

          {courses.length === 0 ? (
            <Card className="border-zinc-800 bg-zinc-900/60 p-8 text-center space-y-3">
              <p className="text-sm text-zinc-400">
                Belum ada mata kuliah yang terdaftar. Tambahkan mata kuliah terlebih dahulu untuk
                menggunakan kalkulator nilai.
              </p>
              <Link href="/courses">
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Tambah Mata Kuliah</span>
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {courses.map((course) => {
                const isPredictionAchievable = course.prediction?.isAchievable ?? true;
                const reqScore = course.prediction?.requiredScore ?? 0;

                return (
                  <Card
                    key={course.id}
                    className="border-zinc-800 bg-zinc-900/80 shadow-xl overflow-hidden relative"
                  >
                    {/* ACCENT COLOR TOP LINE */}
                    <div
                      className="h-1.5 w-full absolute top-0 left-0"
                      style={{ backgroundColor: course.color || "#6366f1" }}
                    />

                    <CardHeader className="pt-6 pb-4 border-b border-zinc-800/80">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-bold text-white">
                              {course.name}
                            </h3>
                            {course.code && (
                              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                {course.code}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400">
                            Dosen: {course.lecturer} • {course.credits} SKS • Semester {course.semester}
                          </p>
                        </div>

                        {/* TARGET & ACTION BUTTONS */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[11px] text-zinc-400 block">Target Nilai:</span>
                            <span className="text-base font-extrabold text-indigo-300">
                              {course.targetGrade} ({course.targetGradeInfo.point.toFixed(2)})
                            </span>
                          </div>

                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleOpenEdit(course)}
                            className="text-xs gap-1.5 h-8"
                          >
                            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Ubah Nilai / Bobot</span>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-5">
                      {/* PREDICTION ALERT BANNER */}
                      <div
                        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          reqScore <= 0
                            ? "bg-emerald-950/30 border-emerald-800/50 text-emerald-300"
                            : isPredictionAchievable
                            ? "bg-indigo-950/40 border-indigo-800/50 text-indigo-200"
                            : "bg-rose-950/30 border-rose-800/50 text-rose-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {reqScore <= 0 ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          ) : isPredictionAchievable ? (
                            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-0.5">
                            <div className="font-bold text-xs sm:text-sm">
                              {reqScore <= 0
                                ? `Target Nilai ${course.targetGrade} Sudah Aman!`
                                : isPredictionAchievable
                                ? `Prediksi UAS: Dibutuhkan Nilai Minimal ${reqScore} untuk Nilai ${course.targetGrade}`
                                : `Target Nilai ${course.targetGrade} Sulit Dicapai (Butuh Nilai ${reqScore} > 100)`}
                            </div>
                            <p className="text-xs opacity-90 leading-relaxed">
                              {course.prediction?.message}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[11px] opacity-75 block">Skor Saat Ini:</span>
                          <span className="text-lg font-black">
                            {course.currentScore}{" "}
                            <span className="text-xs font-semibold">({course.currentGradeInfo.letter})</span>
                          </span>
                        </div>
                      </div>

                      {/* GRADE COMPONENTS BREAKDOWN */}
                      <div>
                        <h4 className="text-xs font-bold text-zinc-300 mb-3 flex items-center justify-between">
                          <span>Komponen Bobot Nilai:</span>
                          <span className="font-mono text-zinc-500 font-normal">
                            Total Bobot: {course.totalWeight}%
                          </span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {course.components.map((comp, idx) => {
                            const isScored = comp.score !== null && comp.score !== undefined;
                            const contribution = isScored
                              ? Math.round(((comp.score! * comp.weight) / 100) * 10) / 10
                              : "-";

                            return (
                              <div
                                key={comp.id || idx}
                                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                                  isScored
                                    ? "bg-zinc-950/70 border-zinc-800"
                                    : "bg-indigo-950/20 border-dashed border-indigo-900/60"
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-xs text-zinc-200 truncate">
                                      {comp.name}
                                    </span>
                                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                      {comp.weight}%
                                    </span>
                                  </div>

                                  <div className="mt-2 text-xl font-black text-white">
                                    {isScored ? (
                                      comp.score
                                    ) : (
                                      <span className="text-xs font-semibold text-indigo-400">
                                        Menunggu Ujian
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-2 pt-2 border-t border-zinc-800/60 text-[10px] text-zinc-400 flex items-center justify-between">
                                  <span>Poin Skor:</span>
                                  <span className="font-mono font-semibold text-zinc-300">
                                    +{contribution}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* MODAL: EDIT KOMPONEN NILAI & TARGET                      */}
        {/* ========================================================= */}
        {editingCourse && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative my-8">
              {/* MODAL HEADER */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-400" />
                    <span>Ubah Komponen Nilai & Target</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {editingCourse.name} ({editingCourse.credits} SKS)
                  </p>
                </div>
                <button
                  onClick={handleCloseEdit}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  ✕
                </button>
              </div>

              {/* TARGET GRADE SELECTOR */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Target Nilai Huruf yang Ingin Dicapai:
                </label>
                <select
                  value={editedTargetGrade}
                  onChange={(e) => setEditedTargetGrade(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
                >
                  <option value="A">A (Sangat Memuaskan - Nilai Minimal 85, Bobot 4.00)</option>
                  <option value="A-">A- (Sangat Baik - Nilai Minimal 80, Bobot 3.75)</option>
                  <option value="B+">B+ (Lebih dari Baik - Nilai Minimal 75, Bobot 3.50)</option>
                  <option value="B">B (Baik - Nilai Minimal 70, Bobot 3.00)</option>
                  <option value="B-">B- (Cukup Baik - Nilai Minimal 65, Bobot 2.75)</option>
                  <option value="C+">C+ (Lebih dari Cukup - Nilai Minimal 60, Bobot 2.50)</option>
                  <option value="C">C (Cukup - Nilai Minimal 55, Bobot 2.00)</option>
                </select>
              </div>

              {/* COMPONENTS EDITOR TABLE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">
                    Daftar Komponen & Bobot:
                  </span>
                  <button
                    type="button"
                    onClick={handleResetToDefaultWeights}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset Default (10-20-30-40)</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {editedComponents.map((comp, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-2 text-xs"
                    >
                      {/* NAMA KOMPONEN */}
                      <input
                        type="text"
                        value={comp.name}
                        onChange={(e) => handleComponentChange(idx, "name", e.target.value)}
                        placeholder="Nama Komponen"
                        className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                      />

                      {/* BOBOT (%) */}
                      <div className="flex items-center gap-1 w-20">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={comp.weight}
                          onChange={(e) =>
                            handleComponentChange(idx, "weight", Number(e.target.value))
                          }
                          className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-2 py-1.5 text-zinc-200 text-center focus:outline-none focus:border-indigo-500"
                        />
                        <span className="text-zinc-500">%</span>
                      </div>

                      {/* NILAI (0-100) */}
                      <div className="w-24">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Nilai (0-100)"
                          value={comp.score ?? ""}
                          onChange={(e) =>
                            handleComponentChange(
                              idx,
                              "score",
                              e.target.value === "" ? null : Number(e.target.value)
                            )
                          }
                          className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-2 py-1.5 text-zinc-200 text-center placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* HAPUS KOMPONEN */}
                      <button
                        type="button"
                        onClick={() => handleRemoveComponent(idx)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        title="Hapus Komponen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddComponent}
                  className="w-full text-xs gap-1 border-dashed"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Komponen Kustom (Praktikum / Kuis)</span>
                </Button>
              </div>

              {/* TOTAL BOBOT VALIDATOR */}
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  Math.abs(currentEditTotalWeight - 100) < 0.01
                    ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-300"
                    : "bg-rose-950/30 border-rose-800/60 text-rose-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {Math.abs(currentEditTotalWeight - 100) < 0.01 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>
                    Total Bobot Komponen: <strong>{currentEditTotalWeight}%</strong>
                  </span>
                </div>
                <span>
                  {Math.abs(currentEditTotalWeight - 100) < 0.01
                    ? "Bobot Pas 100% ✅"
                    : `Harus tepat 100% (Selisih ${Math.abs(100 - currentEditTotalWeight)}%)`}
                </span>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
                  {formError}
                </div>
              )}

              {/* MODAL FOOTER */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseEdit}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveGrades}
                  disabled={isSubmitting || Math.abs(currentEditTotalWeight - 100) >= 0.01}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
