// File: app/api/auth/login/route.ts (FIXED: VERIFICATION CHECK)

import { NextResponse } from 'next/server';
import connectDB from "@/lib/mongodb";
import User, { IUser } from "@/models/User"; 
import jwt from "jsonwebtoken";

interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: Request) {
    if (!JWT_SECRET) {
        return NextResponse.json({ message: "Server error: JWT_SECRET missing" }, { status: 500 });
    }

    try {
        await connectDB();
        
        const { email, password, rememberMe }: LoginRequest = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
        }

        // FIX: Ambil +isVerified secara eksplisit agar aman
        const user = await User.findOne({ email }).select('+password +isVerified') as IUser | null; 
        
        if (!user) {
            return NextResponse.json({ message: "Invalid credentials." }, { status: 401 }); 
        }

        // Cek Status Verifikasi
        if (!user.isVerified) {
            return NextResponse.json({ 
                message: "Account not verified. Please check your email.",
                action: "VERIFY_REQUIRED"
            }, { status: 403 }); 
        }

        // Verifikasi Password
        const isMatch = await user.matchPassword(password);
        
        if (!isMatch) {
            return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
        }

        // Buat Token
        const oneDay = 60 * 60 * 24; 
        const maxAge = rememberMe ? oneDay * 7 : oneDay;
        const jwtExpiresIn = rememberMe ? "7d" : "1d"; 

        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name }, 
            JWT_SECRET, 
            { expiresIn: jwtExpiresIn }
        );

        const response = NextResponse.json(
            { message: "Login Successful", user: { id: user._id, name: user.name, email: user.email } }, 
            { status: 200 }
        );

        response.cookies.set('session', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: maxAge, 
            path: '/',
            sameSite: 'lax',
        });

        return response;

    } catch (error) {
        console.error("[LOGIN_ERROR]:", error); 
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}