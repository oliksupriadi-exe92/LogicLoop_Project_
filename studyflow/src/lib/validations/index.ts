import { z } from "zod";

// ========================================================
// 1. AUTH VALIDATION SCHEMAS
// ========================================================

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal harus 2 karakter")
    .max(50, "Nama maksimal 50 karakter"),
  email: z
    .string()
    .email("Format email tidak valid")
    .toLowerCase(),
  password: z
    .string()
    .min(6, "Password minimal harus 6 karakter")
    .max(100, "Password terlalu panjang"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Format email tidak valid")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password tidak boleh kosong"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ========================================================
// 2. COURSE VALIDATION SCHEMAS
// ========================================================

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const courseSchema = z.object({
  name: z
    .string()
    .min(2, "Nama mata kuliah minimal 2 karakter")
    .max(100, "Nama mata kuliah maksimal 100 karakter"),
  code: z
    .string()
    .max(20, "Kode mata kuliah maksimal 20 karakter")
    .optional()
    .nullable(),
  lecturer: z
    .string()
    .min(2, "Nama dosen minimal 2 karakter")
    .max(100, "Nama dosen maksimal 100 karakter"),
  credits: z
    .number({ message: "SKS harus berupa angka" })
    .int("SKS harus berupa bilangan bulat")
    .min(1, "Minimal 1 SKS")
    .max(8, "Maksimal 8 SKS per mata kuliah"),
  semester: z
    .number({ message: "Semester harus berupa angka" })
    .int("Semester harus berupa bilangan bulat")
    .min(1, "Semester minimal 1")
    .max(14, "Semester maksimal 14"),
  dayOfWeek: z
    .number({ message: "Hari harus berupa angka" })
    .int()
    .min(1, "Hari antara 1 (Senin) hingga 7 (Minggu)")
    .max(7, "Hari antara 1 (Senin) hingga 7 (Minggu)"),
  startTime: z
    .string()
    .regex(timeRegex, "Format jam mulai harus HH:mm (contoh: 08:00)"),
  endTime: z
    .string()
    .regex(timeRegex, "Format jam selesai harus HH:mm (contoh: 10:30)"),
  room: z.string().max(50, "Ruangan maksimal 50 karakter").optional().nullable(),
  color: z.string().max(20).optional().nullable(),
  targetGrade: z.string().max(3).default("A"),
});

export type CourseInput = z.infer<typeof courseSchema>;

// ========================================================
// 3. TASK VALIDATION SCHEMAS
// ========================================================

export const taskSchema = z.object({
  courseId: z
    .string()
    .min(1, "Mata kuliah wajib dipilih"),
  title: z
    .string()
    .min(3, "Judul tugas minimal 3 karakter")
    .max(150, "Judul tugas maksimal 150 karakter"),
  description: z.string().optional().nullable(),
  deadline: z
    .string()
    .or(z.date())
    .refine((val) => !isNaN(new Date(val).getTime()), "Deadline tidak valid"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).default("TODO"),
});

export const taskFilterSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED", "ALL"]).optional(),
  courseId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT", "ALL"]).optional(),
  search: z.string().optional(),
});

export type TaskInput = z.infer<typeof taskSchema>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;

// ========================================================
// 4. GRADE VALIDATION SCHEMAS
// ========================================================

export const gradeComponentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama komponen tidak boleh kosong"),
  weight: z
    .number()
    .min(0, "Bobot tidak boleh negatif")
    .max(100, "Bobot maksimal 100%"),
  score: z
    .number()
    .min(0, "Nilai minimal 0")
    .max(100, "Nilai maksimal 100")
    .nullable()
    .optional(),
});

export const courseGradesSchema = z.object({
  courseId: z.string().min(1, "Course ID wajib disertakan"),
  targetGrade: z.string().default("A"),
  components: z
    .array(gradeComponentSchema)
    .min(1, "Minimal harus ada 1 komponen nilai")
    .refine(
      (comps) => {
        const totalWeight = comps.reduce((sum, c) => sum + c.weight, 0);
        return Math.abs(totalWeight - 100) < 0.01;
      },
      { message: "Total bobot semua komponen nilai harus tepat 100%" }
    ),
});

export type GradeComponentInput = z.infer<typeof gradeComponentSchema>;
export type CourseGradesInput = z.infer<typeof courseGradesSchema>;
