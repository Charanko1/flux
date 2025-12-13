// lib/auth-server.ts (Versi Debugging)
import jwt from "jsonwebtoken";
import { headers } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET; 

export const getUserFromToken = async () => {
  const headersList = await headers(); 
  
  // 1. Cek Header Authorization
  const authHeader = headersList.get("authorization");
  console.log("👉 [DEBUG] Auth Header:", authHeader); // Cek apakah header terkirim?

  if (!authHeader) {
      console.log("❌ [DEBUG] Header Authorization Kosong");
      return null;
  }

  const token = authHeader.split(" ")[1];
  console.log("👉 [DEBUG] Token yang diterima:", token);

  if (!token) {
      console.log("❌ [DEBUG] Token tidak ditemukan dalam header");
      return null;
  }

  if (!JWT_SECRET) {
      console.log("❌ [DEBUG] JWT_SECRET belum diset di .env");
      return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    console.log("✅ [DEBUG] Token Valid! User ID:", decoded.id);
    return decoded;
  } catch (error: any) {
    console.log("❌ [DEBUG] Gagal Verify Token:", error.message);
    return null;
  }
};