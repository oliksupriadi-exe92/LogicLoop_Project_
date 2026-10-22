import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { taskSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tasks/[id]
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id } = await params;

    const task = await prisma.task.findFirst({
      where: { id, userId: session.id },
      include: {
        course: true,
      },
    });

    if (!task) {
      return NextResponse.json({ success: false, error: "Tugas tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("Get Task Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat tugas." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tasks/[id]
 * Memperbarui seluruh isi tugas
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const validation = taskSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Data tugas tidak valid";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const existing = await prisma.task.findFirst({
      where: { id, userId: session.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Tugas tidak ditemukan." }, { status: 404 });
    }

    const { courseId, title, description, deadline, priority, status } = validation.data;
    const isCompleted = status === "COMPLETED";

    const updated = await prisma.task.update({
      where: { id },
      data: {
        courseId,
        title,
        description: description || null,
        deadline: new Date(deadline),
        priority,
        status,
        completedAt: isCompleted ? (existing.completedAt || new Date()) : null,
      },
      include: {
        course: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tugas berhasil diperbarui!",
      data: updated,
    });
  } catch (error) {
    console.error("Update Task Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui tugas." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tasks/[id]
 * Toggle status cepat (misal dari checklist card)
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.task.findFirst({
      where: { id, userId: session.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Tugas tidak ditemukan." }, { status: 404 });
    }

    const newStatus = body.status;
    if (!["TODO", "IN_PROGRESS", "COMPLETED"].includes(newStatus)) {
      return NextResponse.json({ success: false, error: "Status tidak valid." }, { status: 400 });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        status: newStatus,
        completedAt: newStatus === "COMPLETED" ? new Date() : null,
      },
      include: {
        course: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Status tugas diubah menjadi ${newStatus}.`,
      data: updated,
    });
  } catch (error) {
    console.error("Patch Task Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui status tugas." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.task.findFirst({
      where: { id, userId: session.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Tugas tidak ditemukan." }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Tugas "${existing.title}" berhasil dihapus.`,
    });
  } catch (error) {
    console.error("Delete Task Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus tugas." },
      { status: 500 }
    );
  }
}
