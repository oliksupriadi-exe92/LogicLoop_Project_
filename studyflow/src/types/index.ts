// StudyFlow Core Type Definitions

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
export type ReminderType = "EMAIL" | "TELEGRAM" | "SYSTEM";
export type ReminderTiming = "D_MINUS_3" | "D_MINUS_1" | "D_DAY" | "CUSTOM";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
  telegramChatId?: string | null;
  emailNotification: boolean;
  telegramNotification: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseItem {
  id: string;
  userId: string;
  name: string;
  code?: string | null;
  lecturer: string;
  credits: number;
  semester: number;
  dayOfWeek: number; // 1 = Senin, 7 = Minggu
  startTime: string; // "08:00"
  endTime: string;   // "10:30"
  room?: string | null;
  color?: string | null;
  targetGrade?: string | null;
  createdAt: Date;
  updatedAt: Date;
  tasksCount?: number;
  gradeComponents?: GradeComponentItem[];
}

export interface TaskItem {
  id: string;
  userId: string;
  courseId: string;
  title: string;
  description?: string | null;
  deadline: Date | string;
  priority: Priority;
  status: TaskStatus;
  completedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  course?: {
    id: string;
    name: string;
    code?: string | null;
    color?: string | null;
  };
}

export interface GradeComponentItem {
  id: string;
  courseId: string;
  name: string;
  weight: number; // percentage (e.g., 20.0)
  score?: number | null; // e.g. 85.0
  maxScore: number;
}

export interface CourseGradeSummary {
  courseId: string;
  courseName: string;
  credits: number;
  components: GradeComponentItem[];
  totalWeight: number;
  currentScore: number;
  currentLetter: string;
  gpaPoint: number;
  targetGrade?: string;
  requiredExamScore?: number | null; // Prediksi nilai UAS minimal
}

export interface ReminderItem {
  id: string;
  userId: string;
  taskId?: string | null;
  courseId?: string | null;
  type: ReminderType;
  timing: ReminderTiming;
  remindAt: Date | string;
  isSent: boolean;
  sentAt?: Date | string | null;
  message?: string | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
