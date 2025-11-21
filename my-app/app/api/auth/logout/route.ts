// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        // 1. Siapkan Response JSON
        const response = NextResponse.json(
            { message: "Logout Successful" },
            { status: 200 }
        );

        // 2. Hapus Cookie Sesi
        // Untuk menghapus cookie, kita set nilainya menjadi string kosong dan
        // mengatur masa kedaluwarsanya (maxAge) menjadi 0 atau tanggal di masa lalu.
        response.cookies.set('session', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 0, // Mengatur maxAge menjadi 0 segera menghapus cookie
            path: '/',
            sameSite: 'lax',
        });

        // 3. Kembalikan Response
        return response;

    } catch (error) {
        console.error("[LOGOUT_ERROR]:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during logout.";
        return NextResponse.json({ message: "Internal Server Error", error: errorMessage }, { status: 500 });
    }
}