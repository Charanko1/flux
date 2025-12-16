import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User, { IUser } from "@/models/User";
import jwt from "jsonwebtoken";
import { sendEmail } from "@/lib/email";

const JWT_SECRET = process.env.JWT_SECRET;

// Helper untuk respons error standar
const errorResponse = (msg: string, status: number) => 
  NextResponse.json({ message: msg }, { status });

export async function POST(req: NextRequest) {
  // 1. Cek Query Param (type=login, register, atau logout)
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (!JWT_SECRET) return errorResponse("Server error: JWT_SECRET missing", 500);

  try {
    await connectDB();

    // ==========================================
    // 🟢 LOGIC REGISTER
    // ==========================================
    if (type === "register") {
      const body = await req.json();
      const { name, email, password } = body;

      if (!name || !email || !password) return errorResponse("Missing required fields", 400);

      const existingUser = await User.findOne({ email });
      
      // Generate OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      if (existingUser && !existingUser.isVerified) {
        // Update user lama yang belum verif
        existingUser.name = name;
        existingUser.password = password; // Middleware hash akan jalan saat save
        existingUser.otp = otpCode;
        existingUser.otpExpires = otpExpires;
        await existingUser.save();
      } else if (existingUser && existingUser.isVerified) {
        return errorResponse("Email already registered.", 409);
      } else {
        // Buat user baru
        await User.create({
          name, email, password, isVerified: false, otp: otpCode, otpExpires
        });
      }

      // Kirim Email
      await sendEmail(email, 'Kode Verifikasi Akun FLUX', 
        `<p>Halo ${name},</p><p>Kode OTP Anda:</p><h1>${otpCode}</h1>`
      );

      return NextResponse.json({ message: "OTP sent to email.", email }, { status: 201 });
    }

    // ==========================================
    // 🔵 LOGIC LOGIN
    // ==========================================
    else if (type === "login") {
      const body = await req.json();
      const { email, password, rememberMe } = body;

      if (!email || !password) return errorResponse("Email and password required", 400);

      const user = await User.findOne({ email }).select('+password +isVerified +username +avatarUrl') as IUser | null;
      
      if (!user) return errorResponse("Invalid credentials.", 401);
      if (!user.isVerified) {
        return NextResponse.json({ 
          message: "Account not verified.", action: "VERIFY_REQUIRED" 
        }, { status: 403 });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) return errorResponse("Invalid credentials.", 401);

      // Buat Token
      const tokenPayload = { 
        id: user._id, email: user.email, name: user.name, 
        username: user.username, role: user.role || "user" 
      };

      const jwtExpiresIn = rememberMe ? "7d" : "1d";
      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: jwtExpiresIn });

      const response = NextResponse.json({ 
        message: "Login Successful", 
        token, 
        user: { ...tokenPayload, avatarUrl: user.avatarUrl } 
      }, { status: 200 });

      // Set Cookie
      const oneDay = 60 * 60 * 24;
      response.cookies.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: rememberMe ? oneDay * 7 : oneDay,
        path: '/',
        sameSite: 'lax',
      });

      return response;
    }

    // ==========================================
    // 🔴 LOGIC LOGOUT
    // ==========================================
    else if (type === "logout") {
      const response = NextResponse.json({ message: "Logout Successful" }, { status: 200 });
      response.cookies.set('session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0, // Langsung expired
        path: '/',
        sameSite: 'lax',
      });
      return response;
    }

    // Jika type salah
    else {
      return errorResponse("Invalid action type. Use ?type=login|register|logout", 400);
    }

  } catch (error: any) {
    if (error.code === 11000) return errorResponse("Username sudah dipakai.", 409);
    console.error(`Auth Error [${type}]:`, error);
    return errorResponse("Internal Server Error", 500);
  }
}