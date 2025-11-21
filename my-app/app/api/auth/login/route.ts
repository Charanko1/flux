// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Definisikan interface untuk payload request
interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean; // Tambahkan properti opsional rememberMe
}

export async function POST(req: Request) {
    try {
        await connectDB();
        
        // Menggunakan destructuring untuk mengambil semua data yang dibutuhkan
        const { email, password, rememberMe }: LoginRequest = await req.json();

        // 1. Validasi Input Dasar
        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
        }

        // 2. Cari Pengguna
        const user = await User.findOne({ email }).select('+password'); // Pastikan 'password' diambil
        
        if (!user) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 }); // Gunakan 401 untuk User/Password tidak valid
        }

        // 3. Verifikasi Password
        // Pastikan 'user.password' ada, karena .select('+password') digunakan.
        const isMatch = await bcrypt.compare(password, user.password); 
        
        if (!isMatch) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        // 4. Hitung Waktu Kedaluwarsa
        const oneDay = 60 * 60 * 24; // 24 jam dalam detik
        const sevenDays = oneDay * 7; // 7 hari dalam detik

        // Atur maxAge cookie: 7 hari jika 'Remember Me' dicentang, 1 hari jika tidak
        const maxAge = rememberMe ? sevenDays : oneDay;
        const jwtExpiresIn = rememberMe ? "7d" : "1d";

        // 5. Buat Token JWT
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email,
                name: user.name,
            }, 
            process.env.JWT_SECRET!, // Pastikan environment variable ini terdefinisi
            { expiresIn: jwtExpiresIn }
        );

        // 6. Siapkan Response JSON
        const response = NextResponse.json(
            { 
                message: "Login Successful",
                token: token, // Tetap kirim token agar client (localStorage) bisa menyimpannya
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            }, 
            { status: 200 }
        );

        // 7. Set Cookie Session (Secure & HttpOnly)
        response.cookies.set('session', token, {
            httpOnly: true, // Tidak dapat diakses oleh JavaScript client side
            secure: process.env.NODE_ENV === 'production', // Hanya kirim lewat HTTPS di production
            maxAge: maxAge, // Menggunakan maxAge yang telah dihitung (1 hari atau 7 hari)
            path: '/',
            sameSite: 'lax', // Proteksi CSRF
        });

        return response;

    } catch (error) {
        // Logging error yang lebih baik
        console.error("[LOGIN_ERROR]:", error); 
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during login process.";
        return NextResponse.json({ message: "Internal Server Error", error: errorMessage }, { status: 500 });
    }
}