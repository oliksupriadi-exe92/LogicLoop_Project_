import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        telegramChatId: true,
        emailNotification: true,
        telegramNotification: true,
        createdAt: true,
        _count: {
          select: {
            courses: true,
            tasks: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Auth Me Error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { telegramChatId, telegramNotification } = body;

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: {
        telegramChatId:
          telegramChatId !== undefined
            ? telegramChatId
              ? String(telegramChatId).trim()
              : null
            : undefined,
        telegramNotification:
          telegramNotification !== undefined
            ? Boolean(telegramNotification)
            : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        telegramChatId: true,
        telegramNotification: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pengaturan notifikasi Telegram berhasil disimpan.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui profil pengguna." },
      { status: 500 }
    );
  }
}
