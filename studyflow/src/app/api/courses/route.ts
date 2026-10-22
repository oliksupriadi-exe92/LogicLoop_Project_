import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { courseSchema } from "@/lib/validations";

/**
 * GET /api/courses
 * Mengambil semua mata kuliah milik pengguna yang login
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const semester = searchParams.get("semester");

    const courses = await prisma.course.findMany({
      where: {
        userId: session.id,
        ...(semester ? { semester: Number(semester) } : {}),
      },
      include: {
        _count: {
          select: {
            tasks: true,
            gradeComponents: true,
          },
        },
      },
      orderBy: [
        { semester: "asc" },
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    });

    return NextResponse.json({ success: true, data: courses });
  } catch (error) {
    console.error("Fetch Courses Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar mata kuliah." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses
 * Menambahkan mata kuliah baru & otomatis membuat 4 komponen nilai default (Presensi 10%, Tugas 20%, UTS 30%, UAS 40%)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
    }

    const body = await req.json();
    const validation = courseSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Data mata kuliah tidak valid";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const {
      name,
      code,
      lecturer,
      credits,
      semester,
      dayOfWeek,
      startTime,
      endTime,
      room,
      color,
      targetGrade,
    } = validation.data;

    // Simpan Course beserta default Grade Components dalam 1 transaksi atomik
    const newCourse = await prisma.course.create({
      data: {
        userId: session.id,
        name,
        code,
        lecturer,
        credits,
        semester,
        dayOfWeek,
        startTime,
        endTime,
        room: room || null,
        color: color || "#6366f1",
        targetGrade: targetGrade || "A",
        // OTOMASI: Buat 4 komponen nilai standar perkuliahan Indonesia (Total 100%)
        gradeComponents: {
          create: [
            { name: "Presensi", weight: 10.0, score: null, maxScore: 100 },
            { name: "Tugas Mandiri", weight: 20.0, score: null, maxScore: 100 },
            { name: "UTS", weight: 30.0, score: null, maxScore: 100 },
            { name: "UAS", weight: 40.0, score: null, maxScore: 100 },
          ],
        },
      },
      include: {
        gradeComponents: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Mata kuliah dan komponen nilai default berhasil ditambahkan!",
        data: newCourse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Course Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat mata kuliah baru." },
      { status: 500 }
    );
  }
}
