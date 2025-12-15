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

        const user = await User.findOne({ email }).select('+password +isVerified +username +avatarUrl') as IUser | null; 
        
        if (!user) {
            return NextResponse.json({ message: "Invalid credentials." }, { status: 401 }); 
        }

        if (!user.isVerified) {
            return NextResponse.json({ 
                message: "Account not verified. Please check your email.",
                action: "VERIFY_REQUIRED"
            }, { status: 403 }); 
        }

        const isMatch = await user.matchPassword(password);
        
        if (!isMatch) {
            return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
        }

        const oneDay = 60 * 60 * 24; 
        const jwtExpiresIn = rememberMe ? "7d" : "1d"; 

        // ✅ PERBAIKAN: HAPUS avatarUrl DARI PAYLOAD TOKEN (Agar cookie muat)
        const tokenPayload = { 
            id: user._id, 
            email: user.email, 
            name: user.name, 
            username: user.username,
            role: user.role || "user",
            // avatarUrl: user.avatarUrl,  <-- INI SUDAH DIHAPUS
        };

        const token = jwt.sign(
            tokenPayload, 
            JWT_SECRET, 
            { expiresIn: jwtExpiresIn }
        );

        const response = NextResponse.json(
            { 
                message: "Login Successful", 
                token: token, 
                // ✅ Kita kirim avatar lewat body JSON saja, lebih aman
                user: {
                    ...tokenPayload,
                    avatarUrl: user.avatarUrl 
                }
            }, 
            { status: 200 }
        );

        response.cookies.set('session', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: rememberMe ? oneDay * 7 : oneDay, 
            path: '/',
            sameSite: 'lax',
        });

        return response;

    } catch (error) {
        console.error("[LOGIN_ERROR]:", error); 
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}