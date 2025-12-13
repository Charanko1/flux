// lib/jwt.ts
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const signToken = (id: string) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET belum diset di .env");
  }
  // Token expire dalam 30 hari (sesuaikan kebutuhan)
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" });
};