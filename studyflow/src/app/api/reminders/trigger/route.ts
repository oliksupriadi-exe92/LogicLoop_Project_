import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendTaskReminder, sendDailyScheduleReminder } from "@/lib/telegram";
import { formatIndonesianDateTime, getRelativeDeadline, getIndonesianDay } from "@/lib/utils";

/**
 * POST /api/reminders/trigger
 * Menjalankan pemindaian tugas mendesak & mengirimkan notifikasi pengingat ke Telegram mahasiswa
 */
export async function POST() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    // Ambil data user lengkap
    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!user || !user.telegramChatId) {
      return NextResponse.json(
        {
          success: false,
          error: "Telegram Chat ID belum diatur pada akun mahasiswa ini.",
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Ambil tugas yang overdue atau mendekati deadline (< 24 jam)
    const alertTasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        status: { in: ["TODO", "IN_PROGRESS"] },
        deadline: { lte: in24Hours },
      },
      include: {
        course: {
          select: { name: true, code: true },
        },
      },
      orderBy: { deadline: "asc" },
      take: 3,
    });

    let sentCount = 0;
    for (const task of alertTasks) {
      const relative = getRelativeDeadline(task.deadline);
      const isOverdue = new Date(task.deadline).getTime() < now.getTime();

      const sent = await sendTaskReminder(user.telegramChatId, {
        studentName: user.name,
        taskTitle: task.title,
        courseName: task.course.name,
        deadlineFormatted: formatIndonesianDateTime(task.deadline),
        relativeText: relative.text,
        priority: task.priority,
        isOverdue,
      });

      if (sent) sentCount++;
    }

    // Jika tidak ada tugas mendesak, kirim notifikasi jadwal kuliah hari ini sebagai gantinya!
    if (alertTasks.length === 0) {
      const jsDay = now.getDay();
      const currentDayOfWeek = jsDay === 0 ? 7 : jsDay;

      const todayCourses = await prisma.course.findMany({
        where: {
          userId: user.id,
          dayOfWeek: currentDayOfWeek,
        },
        orderBy: { startTime: "asc" },
      });

      await sendDailyScheduleReminder(user.telegramChatId, {
        studentName: user.name,
        dayName: getIndonesianDay(currentDayOfWeek),
        lectures: todayCourses.map((c) => ({
          name: c.name,
          code: c.code,
          startTime: c.startTime,
          endTime: c.endTime,
          room: c.room,
          credits: c.credits,
        })),
      });
      sentCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengirimkan ${sentCount} notifikasi pengingat ke Telegram (@studyflow_logicloop_bot)!`,
      data: {
        sentCount,
        tasksAlerted: alertTasks.map((t) => t.title),
      },
    });
  } catch (error) {
    console.error("Trigger Reminder Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses pengingat notifikasi Telegram." },
      { status: 500 }
    );
  }
}
