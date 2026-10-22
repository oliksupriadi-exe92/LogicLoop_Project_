import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { hashPassword, signJwt, SESSION_COOKIE_NAME } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting (Maksimal 5 percobaan registrasi per IP per menit)
    const ip = req.headers.get("x-forwarded-for") || "local_client";
    const limitResult = rateLimit(`register_${ip}`, { limit: 5, windowMs: 60 * 1000 });
    if (!limitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Terlalu banyak percobaan registrasi. Silakan coba lagi dalam 1 menit.",
        },
        { status: 429 }
      );
    }

    // 2. Parsing & Validasi Input dengan Zod
    const body = await req.json();
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Input tidak valid";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    // 3. Cek Apakah Email Sudah Terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email sudah terdaftar. Silakan login." },
        { status: 409 }
      );
    }

    // 4. Hash Password dengan bcrypt
    const hashedPassword = await hashPassword(password);

    // 5. Simpan User Baru ke Database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "STUDENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // 6. Buat Token JWT Sesi
    const token = await signJwt({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    // 7. Siapkan Response dengan Cookie HTTP-Only yang Aman
    const response = NextResponse.json(
      {
        success: true,
        message: "Registrasi akun berhasil!",
        data: newUser,
      },
      { status: 201 }
    );

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
    console.error("Register Error:", error);
    let errorMessage = "Terjadi kesalahan server saat registrasi.";
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
