import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/dashboard
 * Mengambil ringkasan metrik analitik dashboard untuk mahasiswa:
 * 1. Statistik umum (total MK, SKS, tugas pending/selesai, completion rate)
 * 2. Jadwal kuliah aktif hari ini
 * 3. Tugas terlambat (overdue) yang belum diselesaikan
 * 4. Tugas terdekat yang mendesak (upcoming & urgent)
 * 5. Ringkasan progres per mata kuliah
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

    const now = new Date();
    // Hitung hari saat ini (1 = Senin, ..., 7 = Minggu)
    const jsDay = now.getDay();
    const currentDayOfWeek = jsDay === 0 ? 7 : jsDay;

    // Ambil data mata kuliah beserta tugas-tugasnya
    const courses = await prisma.course.findMany({
      where: { userId: session.id },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            deadline: true,
            priority: true,
            status: true,
          },
        },
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

    // Ambil semua tugas yang belum selesai untuk analisis tenggat waktu
    const allPendingTasks = await prisma.task.findMany({
      where: {
        userId: session.id,
        status: { in: ["TODO", "IN_PROGRESS"] },
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
      orderBy: { deadline: "asc" },
    });

    // Ambil beberapa tugas yang baru saja diselesaikan (maks 5)
    const recentCompletedTasks = await prisma.task.findMany({
      where: {
        userId: session.id,
        status: "COMPLETED",
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
      orderBy: { updatedAt: "desc" },
      take: 5,
    });

    // Klasifikasi tugas overdue vs upcoming
    const overdueTasks = allPendingTasks.filter(
      (task) => new Date(task.deadline).getTime() < now.getTime()
    );

    const upcomingTasks = allPendingTasks
      .filter((task) => new Date(task.deadline).getTime() >= now.getTime())
      .slice(0, 6);

    // Hitung jadwal kuliah hari ini
    const todaySchedule = courses.filter((c) => c.dayOfWeek === currentDayOfWeek);

    // Hitung akumulasi statistik
    const totalCourses = courses.length;
    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

    const totalTasksCount = await prisma.task.count({
      where: { userId: session.id },
    });
    const completedTasksCount = await prisma.task.count({
      where: { userId: session.id, status: "COMPLETED" },
    });
    const pendingTasksCount = allPendingTasks.length;

    const completionRate =
      totalTasksCount > 0
        ? Math.round((completedTasksCount / totalTasksCount) * 100)
        : 100;

    // Hitung tugas yang sangat mendesak (< 24 jam)
    const urgentTasksCount = allPendingTasks.filter((task) => {
      const diffHours =
        (new Date(task.deadline).getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours >= 0 && diffHours <= 24;
    }).length;

    // Ringkasan progres per mata kuliah
    const courseSummaries = courses.map((course) => {
      const totalCourseTasks = course.tasks.length;
      const completedCourseTasks = course.tasks.filter(
        (t) => t.status === "COMPLETED"
      ).length;
      const pendingCourseTasks = totalCourseTasks - completedCourseTasks;
      const progressPercentage =
        totalCourseTasks > 0
          ? Math.round((completedCourseTasks / totalCourseTasks) * 100)
          : 100;

      return {
        id: course.id,
        name: course.name,
        code: course.code,
        lecturer: course.lecturer,
        credits: course.credits,
        semester: course.semester,
        dayOfWeek: course.dayOfWeek,
        startTime: course.startTime,
        endTime: course.endTime,
        room: course.room,
        color: course.color,
        targetGrade: course.targetGrade,
        totalTasks: totalCourseTasks,
        completedTasks: completedCourseTasks,
        pendingTasks: pendingCourseTasks,
        progressPercentage,
      };
    });

    const userRecord = await prisma.user.findUnique({
      where: { id: session.id },
      select: { telegramChatId: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: session.id,
          name: session.name,
          email: session.email,
          role: session.role,
          telegramChatId: userRecord?.telegramChatId || null,
        },
        stats: {
          totalCourses,
          totalCredits,
          totalTasks: totalTasksCount,
          completedTasks: completedTasksCount,
          pendingTasks: pendingTasksCount,
          overdueTasksCount: overdueTasks.length,
          urgentTasksCount,
          completionRate,
          todayLecturesCount: todaySchedule.length,
          currentDayOfWeek,
        },
        todaySchedule,
        overdueTasks,
        upcomingTasks,
        recentCompletedTasks,
        courseSummaries,
      },
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat ringkasan analitik dashboard." },
      { status: 500 }
    );
  }
}
