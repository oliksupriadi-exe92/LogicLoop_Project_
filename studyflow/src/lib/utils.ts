import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Priority } from "@/types";

/**
 * Menggabungkan className Tailwind secara aman dengan clsx dan tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format nama hari dalam Bahasa Indonesia (1 = Senin, 7 = Minggu)
 */
export function getIndonesianDay(dayNumber: number): string {
  const days: Record<number, string> = {
    1: "Senin",
    2: "Selasa",
    3: "Rabu",
    4: "Kamis",
    5: "Jumat",
    6: "Sabtu",
    7: "Minggu",
  };
  return days[dayNumber] ?? "Hari Tidak Diketahui";
}

/**
 * Format tanggal dalam Bahasa Indonesia (contoh: "24 Okt 2026, 23:59")
 */
export function formatIndonesianDateTime(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format deadline relatif (contoh: "2 hari lagi", "Hari ini!", "Terlambat 3 jam")
 */
export function getRelativeDeadline(deadlineInput: Date | string): {
  text: string;
  isOverdue: boolean;
  hoursRemaining: number;
} {
  const deadline = typeof deadlineInput === "string" ? new Date(deadlineInput) : deadlineInput;
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    const overdueHours = Math.abs(diffHours);
    if (overdueHours < 24) {
      return { text: `Terlambat ${overdueHours} jam lalu`, isOverdue: true, hoursRemaining: diffHours };
    }
    const overdueDays = Math.abs(diffDays);
    return { text: `Terlambat ${overdueDays} hari lalu`, isOverdue: true, hoursRemaining: diffHours };
  }

  if (diffHours <= 2) {
    return { text: `Mendesak! ${diffHours} jam lagi`, isOverdue: false, hoursRemaining: diffHours };
  }
  if (diffHours <= 24) {
    return { text: "Hari ini!", isOverdue: false, hoursRemaining: diffHours };
  }
  if (diffDays === 1) {
    return { text: "Besok", isOverdue: false, hoursRemaining: diffHours };
  }

  return { text: `${diffDays} hari lagi`, isOverdue: false, hoursRemaining: diffHours };
}

/**
 * OTOMASI FITUR: Auto-prioritas tugas berdasarkan kedekatan deadline
 * - > 7 hari: LOW
 * - 3 - 7 hari: MEDIUM
 * - 1 - 3 hari: HIGH
 * - <= 24 jam atau lewat: URGENT
 */
export function calculateAutoPriority(deadlineInput: Date | string): Priority {
  const deadline = typeof deadlineInput === "string" ? new Date(deadlineInput) : deadlineInput;
  const now = new Date();
  const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours <= 24) {
    return "URGENT";
  } else if (diffHours <= 72) {
    return "HIGH";
  } else if (diffHours <= 168) { // 7 hari
    return "MEDIUM";
  } else {
    return "LOW";
  }
}

/**
 * Konversi nilai angka (0-100) ke huruf mutu dan bobot IP (skala 4.0 standar Indonesia)
 */
export function scoreToGradeInfo(score: number): {
  letter: string;
  point: number;
  label: string;
} {
  if (score >= 85) return { letter: "A", point: 4.0, label: "Sangat Memuaskan" };
  if (score >= 80) return { letter: "A-", point: 3.75, label: "Sangat Baik" };
  if (score >= 75) return { letter: "B+", point: 3.5, label: "Lebih dari Baik" };
  if (score >= 70) return { letter: "B", point: 3.0, label: "Baik" };
  if (score >= 65) return { letter: "B-", point: 2.75, label: "Cukup Baik" };
  if (score >= 60) return { letter: "C+", point: 2.5, label: "Lebih dari Cukup" };
  if (score >= 55) return { letter: "C", point: 2.0, label: "Cukup" };
  if (score >= 45) return { letter: "D", point: 1.0, label: "Kurang" };
  return { letter: "E", point: 0.0, label: "Gagal" };
}

/**
 * Nilai ambang batas minimum untuk masing-masing huruf target
 */
export function getMinimumScoreForLetter(letter: string): number {
  switch (letter.toUpperCase()) {
    case "A":
      return 85.0;
    case "A-":
      return 80.0;
    case "B+":
      return 75.0;
    case "B":
      return 70.0;
    case "B-":
      return 65.0;
    case "C+":
      return 60.0;
    case "C":
      return 55.0;
    default:
      return 70.0;
  }
}

/**
 * OTOMASI FITUR: Prediksi nilai ujian (misal UAS) yang dibutuhkan untuk mencapai target huruf
 * Rumus:
 * Total Nilai Saat Ini = Sum(bobot_i * nilai_i)
 * Sisa Bobot Target (misal UAS) = bobot_uas
 * Nilai UAS Minimal = (TargetNilaiTotal - TotalNilaiKomponenLain) / (bobot_uas / 100)
 */
export function predictRequiredExamScore(
  knownComponents: { weight: number; score: number }[],
  examWeight: number,
  targetScore: number
): {
  requiredScore: number;
  isAchievable: boolean;
  message: string;
} {
  const currentTotal = knownComponents.reduce(
    (acc, curr) => acc + (curr.score * curr.weight) / 100,
    0
  );

  const neededContribution = targetScore - currentTotal;
  const examFactor = examWeight / 100;
  const requiredScore = Math.ceil((neededContribution / examFactor) * 10) / 10;

  if (requiredScore <= 0) {
    return {
      requiredScore: 0,
      isAchievable: true,
      message: "Target sudah aman! Nilai komponen saat ini sudah mencukupi target.",
    };
  }

  if (requiredScore > 100) {
    return {
      requiredScore,
      isAchievable: false,
      message: `Secara matematis butuh nilai ${requiredScore} (melebihi 100), target nilai sulit tercapai.`,
    };
  }

  return {
    requiredScore,
    isAchievable: true,
    message: `Dibutuhkan nilai minimal ${requiredScore} pada ujian untuk meraih target ini.`,
  };
}

/**
 * OTOMASI FITUR: Hitung IPS/IPK otomatis
 * IP = Sum(SKS * BobotNilai) / Sum(SKS)
 */
export function calculateGpa(courses: { credits: number; gpaPoint: number }[]): {
  gpa: number;
  totalCredits: number;
} {
  const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);
  if (totalCredits === 0) return { gpa: 0, totalCredits: 0 };

  const totalPoints = courses.reduce(
    (acc, c) => acc + c.credits * c.gpaPoint,
    0
  );

  const gpa = Math.round((totalPoints / totalCredits) * 100) / 100;
  return { gpa, totalCredits };
}

export interface ICSCourseItem {
  name: string;
  code?: string | null;
  lecturer: string;
  room?: string | null;
  dayOfWeek: number; // 1 (Senin) - 7 (Minggu)
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

/**
 * OTOMASI FITUR: Ekspor Jadwal Kuliah ke Format iCalendar (.ics) RFC 5545
 * Memungkinkan mahasiswa mengimpor seluruh jadwal kuliah mingguan ke Google Calendar, Apple Calendar, atau Outlook.
 */
export function generateICSContent(courses: ICSCourseItem[]): string {
  const dayMap: Record<number, string> = {
    1: "MO", 2: "TU", 3: "WE", 4: "TH", 5: "FR", 6: "SA", 7: "SU"
  };

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;

  const icsLines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//StudyFlow//Academic Timetable//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Jadwal Kuliah StudyFlow",
    "X-WR-TIMEZONE:Asia/Jakarta"
  ];

  courses.forEach((c, idx) => {
    const dayStr = dayMap[c.dayOfWeek] || "MO";
    const [startH, startM] = (c.startTime || "08:00").split(":").map((v) => parseInt(v, 10) || 0);
    const [endH, endM] = (c.endTime || "10:00").split(":").map((v) => parseInt(v, 10) || 0);

    // Hitung tanggal kejadian terdekat yang cocok dengan hari c.dayOfWeek
    // JS getDay(): 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
    const jsCurrentDay = now.getDay() === 0 ? 7 : now.getDay();
    let daysDiff = c.dayOfWeek - jsCurrentDay;
    if (daysDiff < 0) daysDiff += 7;

    const eventDate = new Date(now);
    eventDate.setDate(now.getDate() + daysDiff);

    const y = eventDate.getFullYear();
    const m = pad(eventDate.getMonth() + 1);
    const d = pad(eventDate.getDate());

    const dtStart = `${y}${m}${d}T${pad(startH)}${pad(startM)}00`;
    const dtEnd = `${y}${m}${d}T${pad(endH)}${pad(endM)}00`;
    const uid = `studyflow-${idx}-${Date.now()}@studyflow.local`;

    icsLines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=Asia/Jakarta:${dtStart}`,
      `DTEND;TZID=Asia/Jakarta:${dtEnd}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${dayStr}`,
      `SUMMARY:${c.name}${c.code ? ` (${c.code})` : ""}`,
      `DESCRIPTION:Dosen: ${c.lecturer || "-"} | Ruangan: ${c.room || "-"}`,
      `LOCATION:${c.room || "Ruang Kelas"}`,
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  });

  icsLines.push("END:VCALENDAR");
  return icsLines.join("\r\n");
}

/**
 * Memicu pengunduhan file .ics di sisi browser klien
 */
export function downloadICSFile(courses: ICSCourseItem[], filename = "jadwal_kuliah_studyflow.ics") {
  const content = generateICSContent(courses);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Menghitung predikat kelulusan akademik berdasarkan IPK (standar perguruan tinggi Indonesia)
 */
export function getAcademicHonor(gpa: number): {
  predicate: string;
  badgeColor: string;
  description: string;
} {
  if (gpa >= 3.51) {
    return {
      predicate: "Dengan Pujian (Cum Laude)",
      badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/40",
      description: "Prestasi akademik luar biasa dengan kehormatan tertinggi.",
    };
  }
  if (gpa >= 3.01) {
    return {
      predicate: "Sangat Memuaskan",
      badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
      description: "Performa perkuliahan sangat baik dan konsisten di atas rata-rata.",
    };
  }
  if (gpa >= 2.76) {
    return {
      predicate: "Memuaskan",
      badgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/40",
      description: "Performa perkuliahan memenuhi kualifikasi sarjana dengan baik.",
    };
  }
  return {
    predicate: "Cukup",
    badgeColor: "bg-zinc-500/15 text-zinc-300 border-zinc-500/40",
    description: "Perlu peningkatan nilai pada semester berjalan atau remedial.",
  };
}

/**
 * Menghasilkan dan mengunduh laporan proyeksi nilai dan target UAS dalam format teks rapi
 */
export function downloadGradeReport(
  courses: Array<{
    name: string;
    code?: string | null;
    lecturer: string;
    credits: number;
    targetGrade: string;
    currentScore: number;
    currentGradeInfo: { letter: string; point: number };
    prediction: { requiredScore: number; isAchievable: boolean; message: string } | null;
    components: Array<{ name: string; weight: number; score: number | null }>;
  }>,
  summary: {
    totalCourses: number;
    totalCredits: number;
    currentGpa: number;
    projectedGpa: number;
  } | null,
  filename = "laporan_proyeksi_nilai_studyflow.txt"
) {
  const lines: string[] = [
    "==================================================================",
    "          STUDYFLOW — LAPORAN PROYEKSI & SIMULATOR NILAI AKADEMIK",
    "==================================================================",
    `Tanggal Ekspor : ${new Date().toLocaleString("id-ID")}`,
    `Total Mata Kuliah : ${summary?.totalCourses ?? courses.length} MK`,
    `Total Beban SKS   : ${summary?.totalCredits ?? 0} SKS`,
    `IPK Berjalan      : ${summary?.currentGpa?.toFixed(2) ?? "0.00"} / 4.00`,
    `Proyeksi IPK Akhir: ${summary?.projectedGpa?.toFixed(2) ?? "0.00"} / 4.00`,
    `Predikat Akademik : ${getAcademicHonor(summary?.projectedGpa ?? 0).predicate}`,
    "==================================================================",
    "",
    "RINCIAN MATA KULIAH & PREDIKSI UAS:",
    "------------------------------------------------------------------"
  ];

  courses.forEach((c, idx) => {
    lines.push(
      `${idx + 1}. ${c.name}${c.code ? ` (${c.code})` : ""} — ${c.credits} SKS`,
      `   Dosen Pengampu : ${c.lecturer || "-"}`,
      `   Nilai Saat Ini : ${c.currentScore.toFixed(1)} (${c.currentGradeInfo.letter})`,
      `   Target Huruf   : ${c.targetGrade}`,
      `   Prediksi UAS   : ${c.prediction ? c.prediction.message : "Belum terhitung"}`
    );

    if (c.components && c.components.length > 0) {
      lines.push("   Komponen Nilai :");
      c.components.forEach((comp) => {
        lines.push(
          `     - ${comp.name} (Bobot ${comp.weight}%): ${comp.score !== null ? comp.score : "Belum Dinilai"}`
        );
      });
    }
    lines.push("");
  });

  lines.push(
    "------------------------------------------------------------------",
    "Dihasilkan secara otomatis oleh StudyFlow (LogicLoop Project)",
    "Buka platform di: http://localhost:3000/grades",
    "=================================================================="
  );

  const textContent = lines.join("\r\n");
  const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

