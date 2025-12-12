// File: app/api/auth/verify-otp/route.ts (FINAL SINKRONISASI)

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    await connectDB();

    // 1. Cari User dan secara eksplisit ambil field yang disembunyikan (+otp dan +otpExpires)
    const user = await User.findOne({ email }).select('+otp +otpExpires');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // 2. Cek apakah OTP dan waktu kadaluarsa ada/aktif (Mencegah error runtime)
    if (!user.otp || !user.otpExpires) {
        return NextResponse.json({ error: 'Verification link expired or already verified.' }, { status: 400 });
    }

    // 3. Cek apakah OTP benar
    if (user.otp !== otp) {
        return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
    }

    // 4. Cek apakah sudah expired
    if (new Date() > user.otpExpires) {
        return NextResponse.json({ error: 'OTP has expired. Please register again.' }, { status: 400 });
    }

    // 5. SUKSES: Verifikasi user & Hapus OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return NextResponse.json({ message: 'Account verified successfully' }, { status: 200 });

  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: 'Server Error during verification' }, { status: 500 });
  }
}