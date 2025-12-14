// lib/sessionCookie.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

type SessionUser = {
  _id: string;
  email: string;
  name: string;
};

export async function setSessionCookie(user: SessionUser) {
  const secret = process.env.JWT_SECRET!;
  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name },
    secret,
    { expiresIn: "7d" }
  );

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return token;
}
