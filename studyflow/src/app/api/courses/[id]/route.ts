import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { courseSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/courses/[id]
 * Mengambil detail mata kuliah tertentu beserta daftar tugas dan komponen nilai
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id } = await params;

    const course = await prisma.course.findFirst({
      where: { id, userId: session.id },
      include: {
        tasks: {
          orderBy: { deadline: "asc" },
        },
        gradeComponents: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Mata kuliah tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    console.error("Get Course Detail Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat detail mata kuliah." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/courses/[id]
 * Memperbarui data mata kuliah
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const validation = courseSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Data tidak valid";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    // Pastikan mata kuliah milik pengguna yang sedang login
    const existing = await prisma.course.findFirst({
      where: { id, userId: session.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Mata kuliah tidak ditemukan." },
        { status: 404 }
      );
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        name: validation.data.name,
        code: validation.data.code,
        lecturer: validation.data.lecturer,
        credits: validation.data.credits,
        semester: validation.data.semester,
        dayOfWeek: validation.data.dayOfWeek,
        startTime: validation.data.startTime,
        endTime: validation.data.endTime,
        room: validation.data.room || null,
        color: validation.data.color || existing.color,
        targetGrade: validation.data.targetGrade || existing.targetGrade,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data mata kuliah berhasil diperbarui!",
      data: updated,
    });
  } catch (error) {
    console.error("Update Course Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui data mata kuliah." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/courses/[id]
 * Menghapus mata kuliah beserta tugas dan komponen nilainya
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.course.findFirst({
      where: { id, userId: session.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Mata kuliah tidak ditemukan." },
        { status: 404 }
      );
    }

    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Mata kuliah "${existing.name}" berhasil dihapus.`,
    });
  } catch (error) {
    console.error("Delete Course Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus mata kuliah." },
      { status: 500 }
    );
  }
}
