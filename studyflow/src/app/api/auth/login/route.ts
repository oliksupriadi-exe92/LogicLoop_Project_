import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { comparePassword, signJwt, SESSION_COOKIE_NAME } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting (Maksimal 5 percobaan login per IP per menit untuk proteksi brute force)
    const ip = req.headers.get("x-forwarded-for") || "local_client";
    const limitResult = rateLimit(`login_${ip}`, { limit: 5, windowMs: 60 * 1000 });
    if (!limitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Terlalu banyak percobaan login yang gagal. Silakan tunggu 1 menit.",
        },
        { status: 429 }
      );
    }

    // 2. Parsing & Validasi Input dengan Zod
    const body = await req.json();
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Input tidak valid";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // 3. Cari User Berdasarkan Email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Email atau password yang kamu masukkan salah." },
        { status: 401 }
      );
    }

    // 4. Verifikasi Password Hashing dengan bcrypt
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Email atau password yang kamu masukkan salah." },
        { status: 401 }
      );
    }

    // 5. Buat Token JWT Sesi
    const token = await signJwt({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // 6. Siapkan Response dengan Cookie HTTP-Only
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil! Selamat datang kembali.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 hari
    });

    return response;
  } catch (error: unknown) {
    console.error("Login Error:", error);
    let errorMessage = "Terjadi kesalahan server saat login.";
    const errStr = error instanceof Error ? error.message : String(error);

    if (errStr.includes("Can't reach database server") || (error as { code?: string })?.code === "P1001") {
      errorMessage =
        "Gagal terhubung ke database PostgreSQL di localhost:5432. Pastikan database server aktif atau gunakan SQLite lokal.";
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
