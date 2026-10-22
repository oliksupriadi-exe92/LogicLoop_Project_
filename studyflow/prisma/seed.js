/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding StudyFlow database...");

  // 1. Buat / update akun mahasiswa demo
  const email = "budi.santoso@mahasiswa.ac.id";
  const hashedPassword = await bcrypt.hash("Rahasia123!", 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Budi Santoso",
      password: hashedPassword,
      telegramChatId: "7455955755",
      telegramNotification: true,
    },
    create: {
      name: "Budi Santoso",
      email,
      password: hashedPassword,
      role: "STUDENT",
      telegramChatId: "7455955755",
      telegramNotification: true,
    },
  });

  console.log(`User seeded: ${user.name} (${user.email})`);

  // Hari ini
  const today = new Date();
  const jsDay = today.getDay();
  const currentDayOfWeek = jsDay === 0 ? 7 : jsDay;

  // 2. Buat courses jika belum ada
  const existingCourses = await prisma.course.findMany({
    where: { userId: user.id },
  });

  let course1, course2, course3, course4;

  if (existingCourses.length === 0) {
    // Mata kuliah 1: Dijadwalkan hari ini agar Dashboard menampilkan "Jadwal Hari Ini"
    course1 = await prisma.course.create({
      data: {
        userId: user.id,
        name: "Algoritma & Pemrograman Lanjut",
        code: "IF2101",
        lecturer: "Dr. Budi Gunawan, M.Kom",
        credits: 3,
        semester: 3,
        dayOfWeek: currentDayOfWeek, // Hari ini!
        startTime: "08:00",
        endTime: "10:30",
        room: "Lab Komputer 3 (Gedung B)",
        color: "#6366f1", // Indigo
        targetGrade: "A",
        gradeComponents: {
          create: [
            { name: "Presensi", weight: 10, score: 95 },
            { name: "Tugas Mandiri", weight: 20, score: 88 },
            { name: "UTS", weight: 30, score: 85 },
            { name: "UAS", weight: 40, score: null },
          ],
        },
      },
    });

    // Mata kuliah 2
    course2 = await prisma.course.create({
      data: {
        userId: user.id,
        name: "Basis Data Relasional & NoSQL",
        code: "IF2204",
        lecturer: "Prof. Siti Aminah, Ph.D",
        credits: 4,
        semester: 3,
        dayOfWeek: (currentDayOfWeek % 7) + 1,
        startTime: "13:00",
        endTime: "16:20",
        room: "Ruang Teori B.201",
        color: "#10b981", // Emerald
        targetGrade: "A",
        gradeComponents: {
          create: [
            { name: "Presensi", weight: 10, score: 100 },
            { name: "Tugas Mandiri", weight: 20, score: 92 },
            { name: "UTS", weight: 30, score: 80 },
            { name: "UAS", weight: 40, score: null },
          ],
        },
      },
    });

    // Mata kuliah 3
    course3 = await prisma.course.create({
      data: {
        userId: user.id,
        name: "Rekayasa Perangkat Lunak",
        code: "IF3102",
        lecturer: "Ir. Hendra Wijaya, MT",
        credits: 3,
        semester: 3,
        dayOfWeek: ((currentDayOfWeek + 1) % 7) + 1,
        startTime: "10:30",
        endTime: "13:00",
        room: "Auditorium Lantai 2",
        color: "#f59e0b", // Amber
        targetGrade: "A",
        gradeComponents: {
          create: [
            { name: "Presensi", weight: 10, score: 90 },
            { name: "Tugas Mandiri", weight: 20, score: 85 },
            { name: "UTS", weight: 30, score: 78 },
            { name: "UAS", weight: 40, score: null },
          ],
        },
      },
    });

    // Mata kuliah 4
    course4 = await prisma.course.create({
      data: {
        userId: user.id,
        name: "Jaringan Komputer & Keamanan Siber",
        code: "IF2105",
        lecturer: "Agus Pratama, M.T",
        credits: 3,
        semester: 3,
        dayOfWeek: ((currentDayOfWeek + 2) % 7) + 1,
        startTime: "14:00",
        endTime: "16:30",
        room: "Lab Jaringan C.102",
        color: "#ec4899", // Pink
        targetGrade: "B+",
        gradeComponents: {
          create: [
            { name: "Presensi", weight: 10, score: 100 },
            { name: "Tugas Mandiri", weight: 20, score: 80 },
            { name: "UTS", weight: 30, score: 75 },
            { name: "UAS", weight: 40, score: null },
          ],
        },
      },
    });

    console.log("Seeded 4 courses with schedules and grade components.");
  } else {
    course1 = existingCourses[0];
    course2 = existingCourses[1] || existingCourses[0];
    course3 = existingCourses[2] || existingCourses[0];
    course4 = existingCourses[3] || existingCourses[0];
  }

  // 3. Buat variasi tugas (Overdue, Upcoming Urgent, Upcoming Medium, Completed)
  const existingTasks = await prisma.task.findMany({
    where: { userId: user.id },
  });

  if (existingTasks.length === 0) {
    // 3a. Tugas Terlambat (Overdue) - deadline 6 jam yang lalu
    const overdueDate = new Date(Date.now() - 6 * 60 * 60 * 1000);
    await prisma.task.create({
      data: {
        userId: user.id,
        courseId: course1.id,
        title: "Tugas 3: Implementasi Binary Search Tree",
        description: "Buat algoritma AVL Tree dalam C++ beserta visualisasi traversal in-order.",
        deadline: overdueDate,
        priority: "URGENT",
        status: "TODO",
      },
    });

    // 3b. Tugas Mendatang Sangat Mendesak (< 24 jam)
    const urgentDate = new Date(Date.now() + 18 * 60 * 60 * 1000);
    await prisma.task.create({
      data: {
        userId: user.id,
        courseId: course2.id,
        title: "Laporan Praktikum: Normalisasi Database 3NF",
        description: "Buat skema ERD dan normalisasi tabel transaksi penjualan ke bentuk 3NF.",
        deadline: urgentDate,
        priority: "URGENT",
        status: "IN_PROGRESS",
      },
    });

    // 3c. Tugas Mendatang (3 hari lagi)
    const upcomingDate1 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    await prisma.task.create({
      data: {
        userId: user.id,
        courseId: course3.id,
        title: "Proposal Proyek: SRS Aplikasi Mobile Healthcare",
        description: "Susun dokumen Software Requirement Specification bab 1 dan use case diagram.",
        deadline: upcomingDate1,
        priority: "HIGH",
        status: "TODO",
      },
    });

    // 3d. Tugas Mendatang (5 hari lagi)
    const upcomingDate2 = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    await prisma.task.create({
      data: {
        userId: user.id,
        courseId: course4.id,
        title: "Konfigurasi Subnetting IPv4 & VLAN",
        description: "Selesaikan topologi Cisco Packet Tracer dan uji ping antar VLAN.",
        deadline: upcomingDate2,
        priority: "MEDIUM",
        status: "TODO",
      },
    });

    // 3e. Tugas Selesai (Completed)
    const completedDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    await prisma.task.create({
      data: {
        userId: user.id,
        courseId: course1.id,
        title: "Tugas 1: Analisis Kompleksitas Waktu Big-O",
        description: "Menghitung notasi asimptotik fungsi rekursif.",
        deadline: completedDate,
        priority: "LOW",
        status: "COMPLETED",
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    });

    console.log("Seeded sample tasks (overdue, urgent, high, and completed).");
  }

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
