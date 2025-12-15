import jwt from "jsonwebtoken";
import { headers, cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Mengembalikan tipe data session.user yang sudah dimodifikasi
   */
  interface Session {
    user: {
      id: string;
      role: string;
      username: string;
    } & DefaultSession["user"];
  }

  /**
   * Tipe data user yang dikembalikan oleh adapter/provider
   */
  interface User {
    role: string;
    username: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Tipe data token JWT
   */
  interface JWT {
    id: string;
    role: string;
    username: string;
  }
}

const JWT_SECRET = process.env.JWT_SECRET;

export const getUserFromToken = async () => {
  // -------------------------------------------------------------
  // 1. CEK LOGIN GOOGLE (NEXTAUTH SESSION)
  // -------------------------------------------------------------
  try {
    const session = await getServerSession(authOptions);
    if (session && session.user) {
      console.log("✅ [DEBUG] Menggunakan Session Google (NextAuth)");
      // Kembalikan data dengan struktur yang sama seperti JWT manual
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        username: session.user.username,
      };
    }
  } catch (error) {
    console.error("⚠️ [DEBUG] Gagal cek NextAuth Session:", error);
  }

  // -------------------------------------------------------------
  // 2. CEK LOGIN MANUAL (CUSTOM JWT - Header Authorization)
  // -------------------------------------------------------------
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    if (token && JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        console.log("✅ [DEBUG] Menggunakan Token Header (Bearer)");
        return decoded;
      } catch (error) {
        console.log("❌ [DEBUG] Token Header Invalid");
      }
    }
  }

  // -------------------------------------------------------------
  // 3. CEK LOGIN MANUAL (CUSTOM JWT - Cookie "session")
  // -------------------------------------------------------------
  // Ini penting jika kamu login manual tapi token disimpan di httpOnly cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (sessionCookie && JWT_SECRET) {
    try {
      const decoded = jwt.verify(sessionCookie.value, JWT_SECRET) as any;
      console.log("✅ [DEBUG] Menggunakan Token Cookie ('session')");
      return decoded;
    } catch (error) {
      console.log("❌ [DEBUG] Token Cookie Invalid");
    }
  }

  // -------------------------------------------------------------
  // JIKA SEMUA GAGAL
  // -------------------------------------------------------------
  console.log("❌ [DEBUG] Tidak ada user yang login (Unauthorized)");
  return null;
};