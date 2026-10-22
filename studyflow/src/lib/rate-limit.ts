/**
 * In-memory sliding window rate limiter
 * Mencegah brute-force attack pada endpoint autentikasi (login & register)
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  limit: number;      // Maksimal request diperbolehkan
  windowMs: number;   // Durasi waktu jendela dalam milidetik (contoh: 60.000 ms = 1 menit)
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 5, windowMs: 60 * 1000 }
): { success: boolean; limit: number; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // Jika belum ada atau jendela waktu sudah kadaluarsa
  if (!record || now > record.resetAt) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + options.windowMs,
    };
    rateLimitMap.set(identifier, newRecord);
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      resetAt: newRecord.resetAt,
    };
  }

  // Jika masih dalam jendela waktu
  if (record.count >= options.limit) {
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - record.count,
    resetAt: record.resetAt,
  };
}
