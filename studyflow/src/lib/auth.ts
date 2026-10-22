import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "studyflow_super_secret_jwt_key_min_32_characters_long_12345"
);

export const SESSION_COOKIE_NAME = "studyflow_session";

export interface SessionPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Hash password dengan bcrypt (salt rounds = 12)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verifikasi kecocokan password dengan hash bcrypt
 */
export async function comparePassword(
  plainText: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}

/**
 * Membuat token JWT sesi pengguna (berlaku 7 hari)
 */
export async function signJwt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Memverifikasi keabsahan token JWT
 */
export async function verifyJwt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Mendapatkan data pengguna yang sedang login dari HTTP-Only cookie di Server Components / API
 */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyJwt(token);
  } catch {
    return null;
  }
}
