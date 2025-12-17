import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth"; // Import wajib buat fix error 405
import { authOptions } from "../[...nextauth]/route"; // 👈 Pastikan path ini benar mengarah ke file config NextAuth kamu
import connectDB from "@/lib/mongodb"; 
import User, { IUser } from "@/models/User";
import jwt from "jsonwebtoken";
import { sendEmail } from "@/lib/email";

const JWT_SECRET = process.env.JWT_SECRET;

// Helper response error
const errorResponse = (msg: string, status: number) => 
  NextResponse.json({ message: msg }, { status });

// ==================================================================
// ✅ 1. METHOD GET (PENAMBAHAN BARU UNTUK FIX ERROR 405 & Client Fetch Error)
// ==================================================================
export async function GET(req: NextRequest) {
  // Mengambil session dari NextAuth (Google Login, dll)
  const session = await getServerSession(authOptions);

  // Jika tidak ada session, kembalikan object kosong/null agar tidak error 404/500
  if (!session) {
    return NextResponse.json(null);
  }

  // Kembalikan data session ke frontend
  return NextResponse.json(session);
}

// ==================================================================
// ✅ 2. METHOD POST (LOGIC REGISTER & LOGIN MANUAL KAMU)
// ==================================================================
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (!JWT_SECRET) return errorResponse("Server error: JWT_SECRET missing", 500);

  try {
    await connectDB(); // Panggil koneksi DB

    // --------------------------------------------------------
    // A. REGISTER (Kirim OTP)
    // --------------------------------------------------------
    if (type === "register") {
      const body = await req.json();
      const { name, email, password } = body;

      if (!name || !email || !password) return errorResponse("Missing required fields", 400);

      const existingUser = await User.findOne({ email });
      
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

      if (existingUser && !existingUser.isVerified) {
        // User ada tapi belum verif -> Update data & OTP
        existingUser.name = name;
        existingUser.password = password; 
        existingUser.otp = otpCode;
        existingUser.otpExpires = otpExpires;
        await existingUser.save();
      } else if (existingUser && existingUser.isVerified) {
        return errorResponse("Email already registered.", 409);
      } else {
        // User baru
        await User.create({
          name, email, password, isVerified: false, otp: otpCode, otpExpires
        });
      }

      // Kirim Email
      await sendEmail(email, 'Kode Verifikasi Akun FLUX', 
        `<div style="font-family: sans-serif; padding: 20px;">
           <h2>Halo ${name},</h2>
           <p>Terima kasih telah mendaftar di Flux. Kode OTP Anda adalah:</p>
           <h1 style="color: #f59e0b; letter-spacing: 5px;">${otpCode}</h1>
           <p>Kode ini berlaku selama 10 menit.</p>
         </div>`
      );

      return NextResponse.json({ message: "OTP sent to email.", email }, { status: 201 });
    }

    // --------------------------------------------------------
    // B. LOGIN MANUAL (Cek Password & Buat Token)
    // --------------------------------------------------------
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

      // Buat Token JWT
      const tokenPayload = { 
        userId: user._id, 
        email: user.email, 
        name: user.name, 
        username: user.username, 
        role: user.role || "user",
        avatarUrl: user.avatarUrl
      };

      const jwtExpiresIn = rememberMe ? "7d" : "1d";
      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: jwtExpiresIn });

      const response = NextResponse.json({ 
        message: "Login Successful", 
        token, 
        user: tokenPayload 
      }, { status: 200 });

      // Set Cookie Manual
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

    // --------------------------------------------------------
    // C. LOGOUT MANUAL
    // --------------------------------------------------------
    else if (type === "logout") {
      const response = NextResponse.json({ message: "Logout Successful" }, { status: 200 });
      response.cookies.set('session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0, 
        path: '/',
        sameSite: 'lax',
      });
      return response;
    }

    else {
      return errorResponse("Invalid action type. Use ?type=login|register|logout", 400);
    }

  } catch (error: any) {
    if (error.code === 11000) return errorResponse("Username/Email sudah terpakai.", 409);
    console.error(`Auth Error [${type}]:`, error);
    return errorResponse("Internal Server Error", 500);
  }
}