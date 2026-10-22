import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "studyflow_super_secret_jwt_key_min_32_characters_long_12345"
);

const SESSION_COOKIE_NAME = "studyflow_session";

// Rute yang WAJIB login untuk diakses
const protectedRoutes = [
  "/dashboard",
  "/courses",
  "/tasks",
  "/grades",
  "/settings",
];

// Rute khusus tamu (jika sudah login, redirect ke dashboard)
const authRoutes = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Verifikasi keabsahan token
  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // 1. Proteksi Halaman Dashboard/Mahasiswa
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Jika sudah login dan mencoba ke halaman login/register -> lempar ke dashboard
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/courses/:path*",
    "/tasks/:path*",
    "/grades/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
