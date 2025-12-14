// app/api/auth/register/route.ts (Tidak ada perubahan yang diperlukan)

import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/mongodb"; 
import User from "@/models/User"; 
import { sendEmail } from "@/lib/email";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, password } = body; 
        
        if (!name || !email || !password) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        await connectDB();

        const existingUser = await User.findOne({ email });

        // Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 

        
        if (existingUser && !existingUser.isVerified) {
             // Update user lama
             existingUser.name = name;
             existingUser.email = email;
             existingUser.password = password; // KIRIM PASSWORD ASLI (Plain)
             existingUser.otp = otpCode;
             existingUser.otpExpires = otpExpires;
             await existingUser.save(); // Middleware akan meng-hash password otomatis di sini

        } else if (existingUser && existingUser.isVerified) {
             return NextResponse.json({ message: "Email already registered." }, { status: 409 }); 
             
        } else {
             // Buat user baru
             await User.create({ 
                 name, 
                 email, 
                 password, // KIRIM PASSWORD ASLI (Plain)
                 isVerified: false, 
                 otp: otpCode,
                 otpExpires: otpExpires,
             }); // Middleware akan meng-hash password otomatis di sini
        }
        
        // Kirim Email OTP
        if (email && JWT_SECRET) {
             await sendEmail(
                 email,
                 'Kode Verifikasi Akun FLUX',
                 `<p>Halo ${name},</p><p>Kode OTP Anda:</p><h1 style="background:#f4f4f4;padding:10px;text-align:center;">${otpCode}</h1>`
             );
        }

        return NextResponse.json({ 
            message: "OTP sent to email.", 
            email 
        }, { status: 201 });

    } catch (error: any) {
        if (error.code === 11000) {
             return NextResponse.json({ message: "Username sudah dipakai user lain." }, { status: 409 });
        }
        console.error("Registration Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}