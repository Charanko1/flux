// /app/api/auth/login/route.ts

import { NextResponse } from 'next/server';
import connectDB from "@/lib/mongodb";
// Import IUser dan User Model
import User, { IUser } from "@/models/User"; 
import jwt from "jsonwebtoken";

// Definisikan interface untuk payload request
interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

// Definisikan JWT_SECRET di luar try/catch
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: Request) {
    // 1. Validasi Environment Variable
    if (!JWT_SECRET) {
        console.error("❌ ERROR: JWT_SECRET environment variable is not defined.");
        return NextResponse.json({ message: "Server configuration error." }, { status: 500 });
    }

    try {
        await connectDB();
        
        const { email, password, rememberMe }: LoginRequest = await req.json();

        // 2. Validasi Input Dasar
        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
        }

        // 3. Cari Pengguna (Casting ke IUser agar Typescript mengenali matchPassword)
        // .select('+password') penting agar field password yang disembunyikan diambil.
        const user = await User.findOne({ email }).select('+password') as IUser | null; 
        
        if (!user) {
            // Gunakan pesan error umum untuk keamanan
            return NextResponse.json({ message: "Invalid credentials." }, { status: 401 }); 
        }

        // 4. Verifikasi Password menggunakan metode di Model User
        // Ini lebih aman dan bersih daripada menggunakan bcrypt.compare langsung
        const isMatch = await user.matchPassword(password);
        
        if (!isMatch) {
            return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
        }

        // 5. Hitung Waktu Kedaluwarsa
        const oneDay = 60 * 60 * 24; 
        const maxAge = rememberMe ? oneDay * 7 : oneDay; // Cookie Max Age (in seconds)
        const jwtExpiresIn = rememberMe ? "7d" : "1d"; // JWT Expires In (for payload)

        // 6. Buat Token JWT
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email,
                name: user.name,
            }, 
            JWT_SECRET, 
            { expiresIn: jwtExpiresIn }
        );

        // 7. Siapkan Response & Set Cookie Session
        
        // Buat response dengan data user
        const response = NextResponse.json(
            { 
                message: "Login Successful",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            }, 
            { status: 200 }
        );

        // Set Cookie Session (HttpOnly adalah kunci keamanan)
        response.cookies.set('session', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: maxAge, 
            path: '/',
            sameSite: 'lax',
        });

        return response;

    } catch (error) {
        // Logging error yang lebih baik
        console.error("[LOGIN_ERROR]:", error); 
        // Mengembalikan pesan error umum ke client
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}