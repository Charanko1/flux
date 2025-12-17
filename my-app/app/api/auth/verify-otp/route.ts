import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb'; // 👈 DEFAULT IMPORT
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    await connectDB(); // 👈 PANGGIL connectDB()

    // Ambil user
    const user = await User.findOne({ email }).select('+otp +otpExpires +username +avatarUrl');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (!user.otp || !user.otpExpires) {
        if (user.isVerified) {
             return NextResponse.json({ message: 'Account already verified' }, { status: 200 });
        }
        return NextResponse.json({ error: 'Verification expired or invalid.' }, { status: 400 });
    }

    if (user.otp !== otp) {
        return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
    }

    if (new Date() > user.otpExpires) {
        return NextResponse.json({ error: 'OTP has expired. Please register again.' }, { status: 400 });
    }

    // SUKSES
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        name: user.name,
        username: user.username,
        role: user.role 
      },
      JWT_SECRET, 
      { expiresIn: "7d" }
    );

    return NextResponse.json({ 
        message: 'Account verified successfully',
        token
    }, { status: 200 });

  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: 'Server Error during verification' }, { status: 500 });
  }
}