// /app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb"; // Asumsi Anda menggunakan alias '@/lib/mongodb'
import User from "@/models/User";     // Asumsi Anda menggunakan alias '@/models/User'
import bcrypt from "bcryptjs";         

export async function POST(req: Request) {
    try {
        if (req.method !== 'POST') {
            return new NextResponse(JSON.stringify({ message: "Method Not Allowed" }), { status: 405 });
        }
        
        const body = await req.json();
        // --- PERBAIKAN PENTING DI SINI: Menerima 'username' dari Frontend ---
        const { username, email, password } = body; 
        
        // 1. Validasi Input Dasar (Gunakan username)
        if (!username || !email || !password) {
            return new NextResponse(JSON.stringify({ message: "Missing required fields (username, email, or password)" }), { status: 400 });
        }

        // 2. Hubungkan ke Database
        await connectDB();

        // 3. Cek Pengguna yang Sudah Ada (Email harus unik)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return new NextResponse(JSON.stringify({ message: "Email already exists" }), { status: 409 }); 
        }

        // 4. Hashing Password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // 5. Membuat dan Menyimpan Pengguna Baru
        // --- SESUAIKAN: Simpan username ke field 'name' di Mongoose ---
        const user = await User.create({ 
            name: username, // Mapping username (dari frontend) ke name (di database)
            email, 
            password: password
        });

        // 6. Respon Sukses
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
        };

        return new NextResponse(JSON.stringify({ 
            message: "User registered successfully", 
            user: userResponse 
        }), { status: 201 });

    } catch (error) {
        // Ini adalah tempat status 500 Anda berasal. Kita akan mencetak errornya di server.
        console.error("Registration Error (500):", error);

        // Jika error terkait Mongoose Validation (misalnya password < 6 karakter), 
        // kita bisa kirim 400, tapi untuk error fatal lainnya, 500 sudah benar.
        return new NextResponse(JSON.stringify({ 
            message: "Internal Server Error. Check server logs for details." 
        }), { status: 500 });
    }
}