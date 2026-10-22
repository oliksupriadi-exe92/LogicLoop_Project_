/**
 * StudyFlow - Telegram Bot Integration Service
 * Digunakan untuk mengirim notifikasi pengingat tugas kuliah dan jadwal harian langsung ke HP/Laptop mahasiswa.
 */

const TELEGRAM_API_BASE = "https://api.telegram.org";

/**
 * Mengirim pesan teks umum ke akun Telegram mahasiswa
 */
export async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) {
    console.warn("Telegram bot token or chatId is missing.");
    return false;
  }

  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });

    const data = await res.json();
    return Boolean(data.ok);
  } catch (err) {
    console.error("Failed to send Telegram message:", err);
    return false;
  }
}

/**
 * Mengirim notifikasi pengingat batas waktu tugas (Deadline Reminder)
 */
export async function sendTaskReminder(
  chatId: string,
  params: {
    studentName: string;
    taskTitle: string;
    courseName: string;
    deadlineFormatted: string;
    relativeText: string;
    priority: string;
    isOverdue: boolean;
  }
): Promise<boolean> {
  const headerIcon = params.isOverdue ? "🚨" : "⚠️";
  const statusTitle = params.isOverdue
    ? "*PERINGATAN: TUGAS MELEWATI TENGGAT WAKTU!*"
    : "*PENGINGAT DEADLINE MENDEKATI!*";

  const message =
    `${headerIcon} ${statusTitle}\n\n` +
    `Halo *${params.studentName}*, sistem mendeteksi tugas kuliah yang butuh perhatianmu:\n\n` +
    `📝 *Tugas:* ${params.taskTitle}\n` +
    `📚 *Mata Kuliah:* ${params.courseName}\n` +
    `⏰ *Batas Waktu:* ${params.deadlineFormatted}\n` +
    `⏳ *Sisa Waktu:* ${params.relativeText}\n` +
    `🔥 *Prioritas:* ${params.priority}\n\n` +
    `👉 Buka dan selesaikan di web StudyFlow:\n` +
    `http://localhost:3000/tasks`;

  return await sendTelegramMessage(chatId, message);
}

/**
 * Mengirim ringkasan jadwal kuliah harian di pagi hari
 */
export async function sendDailyScheduleReminder(
  chatId: string,
  params: {
    studentName: string;
    dayName: string;
    lectures: Array<{
      name: string;
      code?: string | null;
      startTime: string;
      endTime: string;
      room?: string | null;
      credits: number;
    }>;
  }
): Promise<boolean> {
  if (params.lectures.length === 0) {
    const freeMessage =
      `🌅 *SELAMAT PAGI, ${params.studentName.toUpperCase()}!* ☕\n\n` +
      `Hari ini (${params.dayName}) kamu *bebas dari jadwal kuliah*!\n` +
      `Gunakan waktu ini untuk beristirahat atau mencicil tugas mandiri di StudyFlow.`;
    return await sendTelegramMessage(chatId, freeMessage);
  }

  let lectureList = "";
  params.lectures.forEach((lec, idx) => {
    lectureList +=
      `\n${idx + 1}. *${lec.name}* (${lec.credits} SKS)\n` +
      `   ⏰ ${lec.startTime} - ${lec.endTime}\n` +
      `   📍 ${lec.room || "Ruang Kelas"}\n`;
  });

  const message =
    `🌅 *JADWAL KULIAH HARI INI (${params.dayName.toUpperCase()})* 🎓\n\n` +
    `Semangat beraktivitas, *${params.studentName}*! Berikut jadwal kuliahmu hari ini:\n` +
    lectureList +
    `\nBuka dashboard StudyFlow untuk melihat detail:\n` +
    `http://localhost:3000/dashboard`;

  return await sendTelegramMessage(chatId, message);
}
