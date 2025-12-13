// lib/auth.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getUserIdFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  try {
    const secret = process.env.JWT_SECRET || "";
    const decoded: any = jwt.verify(token, secret);
    return decoded.id as string;
  } catch {
    return null;
  }
}
