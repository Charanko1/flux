// File: app/api/auth/register/route.ts (SINKRONISASI)

import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/mongodb"; 
import User from "@/models/User"; 
import bcrypt from "bcryptjs"; 
import { sendEmail } from "@/lib/email";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // --- SINKRONISASI: Menerima 'name', 'email', 'password' ---
        const { name, email, password } = body; 
        
        // 1. Validasi Input Dasar
        if (!name || !email || !password) {
            return NextResponse.json({ message: "Missing required fields (name, email, or password)" }, { status: 400 });
        }

        await connectDB();

        const existingUser = await User.findOne({ email });

        // 2. Generate OTP 6 Digit & Expiry Time
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

        const saltRounds = 10;
        // Asumsi middleware pre-save di model kamu sudah di-hash
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // 3. Update atau Buat User
        if (existingUser && !existingUser.isVerified) {
             // Update data user lama yang belum verified
             existingUser.name = name;
             existingUser.email = email;
             existingUser.password = hashedPassword;
             existingUser.otp = otpCode;
             existingUser.otpExpires = otpExpires;
             await existingUser.save();

        } else if (existingUser && existingUser.isVerified) {
             // Sudah ada & sudah verified -> Tolak
             return NextResponse.json({ message: "Email already registered and verified." }, { status: 409 }); 
             
        } else {
             // User baru murni -> Buat baru
             await User.create({ 
                 name, 
                 email, 
                 password: hashedPassword,
                 isVerified: false, 
                 otp: otpCode,
                 otpExpires: otpExpires,
             });
        }
        
        // 4. Kirim Email OTP
        if (email && JWT_SECRET) {
             await sendEmail(
                 email,
                 'Kode Verifikasi Akun FLUX',
                 `<p>Halo ${name},</p><p>Gunakan kode OTP ini untuk memverifikasi akun Anda:</p><h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px; color: #333;">${otpCode}</h1><p>Kode ini berlaku 10 menit. Jangan berikan kepada siapapun.</p>`
             );
        }

        // 5. Respon Sukses
        return NextResponse.json({ 
            message: "OTP sent to email. Please verify your account.", 
            email 
        }, { status: 201 });

    } catch (error) {
        console.error("Registration Error:", error);
        return NextResponse.json({ 
            message: "Internal Server Error. Please check server logs." 
        }, { status: 500 });
    }
}