import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  scoreToGradeInfo,
  getMinimumScoreForLetter,
  predictRequiredExamScore,
  calculateGpa,
} from "@/lib/utils";

/**
 * GET /api/grades
 * Mengambil data mata kuliah beserta komponen nilainya untuk kalkulator nilai & prediksi UAS
 */
export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    // Ambil semua mata kuliah mahasiswa beserta komponen nilainya
    const courses = await prisma.course.findMany({
      where: { userId: session.id },
      include: {
        gradeComponents: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: [{ semester: "asc" }, { name: "asc" }],
    });

    const detailedCourses = courses.map((course) => {
      const components = course.gradeComponents;
      const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);

      // Komponen yang sudah ada nilainya
      const scoredComponents = components.filter(
        (c) => c.score !== null && c.score !== undefined
      );

      // Komponen yang belum ada nilainya (biasanya UAS)
      const unscoredComponents = components.filter(
        (c) => c.score === null || c.score === undefined
      );

      // Total nilai akumulasi saat ini: sum(weight * score / 100)
      const currentScore = scoredComponents.reduce(
        (acc, c) => acc + ((c.score ?? 0) * c.weight) / 100,
        0
      );

      const completedWeight = scoredComponents.reduce(
        (sum, c) => sum + c.weight,
        0
      );
      const remainingWeight = unscoredComponents.reduce(
        (sum, c) => sum + c.weight,
        0
      );

      // Target huruf mutu & skor batas bawah
      const targetLetter = course.targetGrade || "A";
      const targetMinScore = getMinimumScoreForLetter(targetLetter);

      // Prediksi nilai ujian yang belum terisi (biasanya komponen terakhir / UAS)
      let prediction = null;
      if (remainingWeight > 0) {
        prediction = predictRequiredExamScore(
          scoredComponents.map((c) => ({ weight: c.weight, score: c.score ?? 0 })),
          remainingWeight,
          targetMinScore
        );
      } else {
        // Semua komponen sudah dinilai
        const finalGrade = scoreToGradeInfo(currentScore);
        prediction = {
          requiredScore: 0,
          isAchievable: currentScore >= targetMinScore,
          message: `Nilai akhir sudah final: ${Math.round(currentScore * 10) / 10} (${finalGrade.letter}) - ${finalGrade.label}`,
        };
      }

      // Huruf mutu saat ini
      const currentGradeInfo = scoreToGradeInfo(currentScore);
      const targetGradeInfo = scoreToGradeInfo(targetMinScore);

      return {
        id: course.id,
        name: course.name,
        code: course.code,
        lecturer: course.lecturer,
        credits: course.credits,
        semester: course.semester,
        color: course.color,
        targetGrade: targetLetter,
        targetMinScore,
        currentScore: Math.round(currentScore * 10) / 10,
        currentGradeInfo,
        targetGradeInfo,
        totalWeight,
        completedWeight,
        remainingWeight,
        components,
        unscoredComponents,
        prediction,
      };
    });

    // Hitung IPS/IPK berjalan & proyeksi target
    const currentCoursesForGpa = detailedCourses.map((c) => ({
      credits: c.credits,
      gpaPoint: c.currentGradeInfo.point,
    }));
    const currentGpaResult = calculateGpa(currentCoursesForGpa);

    const projectedCoursesForGpa = detailedCourses.map((c) => ({
      credits: c.credits,
      gpaPoint: c.targetGradeInfo.point,
    }));
    const projectedGpaResult = calculateGpa(projectedCoursesForGpa);

    // Hitung berapa MK yang prediksinya aman
    const achievableCoursesCount = detailedCourses.filter(
      (c) => c.prediction?.isAchievable
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalCourses: detailedCourses.length,
          totalCredits: currentGpaResult.totalCredits,
          currentGpa: currentGpaResult.gpa,
          projectedGpa: projectedGpaResult.gpa,
          achievableCoursesCount,
        },
        courses: detailedCourses,
      },
    });
  } catch (error) {
    console.error("Fetch Grades API Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat data kalkulator nilai." },
      { status: 500 }
    );
  }
}
