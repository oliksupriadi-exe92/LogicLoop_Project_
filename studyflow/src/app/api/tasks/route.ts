import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { taskSchema } from "@/lib/validations";
import { calculateAutoPriority } from "@/lib/utils";

/**
 * GET /api/tasks
 * Mengambil daftar tugas dengan filter (status, mata kuliah, prioritas, pencarian kata kunci)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.id,
        ...(courseId ? { courseId } : {}),
        ...(status && status !== "ALL" ? { status: status as "TODO" | "IN_PROGRESS" | "COMPLETED" } : {}),
        ...(priority && priority !== "ALL" ? { priority: priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT" } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // Belum/Proses didahulukan sebelum Selesai
        { deadline: "asc" }, // Deadline terdekat di urutan teratas
      ],
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Fetch Tasks Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar tugas." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Membuat tugas baru dengan integrasi Auto-Prioritas berdasarkan deadline
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
    }

    const body = await req.json();
    const validation = taskSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Data tugas tidak valid";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const { courseId, title, description, deadline, priority, status } = validation.data;

    // Verifikasi kepemilikan mata kuliah
    const course = await prisma.course.findFirst({
      where: { id: courseId, userId: session.id },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Mata kuliah yang dipilih tidak ditemukan." },
        { status: 404 }
      );
    }

    const deadlineDate = new Date(deadline);

    // OTOMASI: Jika prioritas tidak diatur spesifik, gunakan auto-prioritas dari kedekatan deadline
    const finalPriority =
      priority && priority !== "MEDIUM"
        ? priority
        : calculateAutoPriority(deadlineDate);

    const newTask = await prisma.task.create({
      data: {
        userId: session.id,
        courseId,
        title,
        description: description || null,
        deadline: deadlineDate,
        priority: finalPriority,
        status: status || "TODO",
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Tugas berhasil ditambahkan!",
        data: newTask,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Task Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat tugas baru." },
      { status: 500 }
    );
  }
}
