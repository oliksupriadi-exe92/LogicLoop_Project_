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
