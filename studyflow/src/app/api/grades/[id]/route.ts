import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { courseGradesSchema } from "@/lib/validations";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/grades/[id]
 * Memperbarui target huruf nilai dan seluruh komponen bobot/nilai untuk satu mata kuliah
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const { id: courseId } = await context.params;

    // Pastikan mata kuliah milik pengguna yang login
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || course.userId !== session.id) {
      return NextResponse.json(
        { success: false, error: "Mata kuliah tidak ditemukan atau akses ditolak." },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Validasi input
    const validation = courseGradesSchema.safeParse({
      ...body,
      courseId,
    });

    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Format data komponen nilai tidak valid.";
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400 }
      );
    }

    const { targetGrade, components } = validation.data;

    // Lakukan atomic transaction untuk memperbarui targetGrade dan komponen nilai
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update target grade pada course
      await tx.course.update({
        where: { id: courseId },
        data: { targetGrade },
      });

      // 2. Hapus komponen nilai lama
      await tx.gradeComponent.deleteMany({
        where: { courseId },
      });

      // 3. Masukkan komponen nilai baru
      await tx.gradeComponent.createMany({
        data: components.map((c) => ({
          courseId,
          name: c.name,
          weight: c.weight,
          score: c.score !== undefined && c.score !== null ? Number(c.score) : null,
          maxScore: 100,
        })),
      });

      // 4. Ambil data segar
      return await tx.course.findUnique({
        where: { id: courseId },
        include: {
          gradeComponents: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Komponen nilai dan target berhasil disimpan.",
      data: result,
    });
  } catch (error) {
    console.error("Update Grades API Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan perubahan komponen nilai." },
      { status: 500 }
    );
  }
}
