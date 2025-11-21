// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongooseAdapter } from "@next-auth/mongoose-adapter";
import connectDB from "@/lib/mongodb"; // <-- Menggunakan koneksi Mongoose Anda
import User from "@/models/User"; // <-- Menggunakan model User Anda

// Karena adapter Mongoose memerlukan model dan promise koneksi,
// kita panggil connectDB di sini untuk mendapatkan Mongoose instance
// yang sudah terkoneksi sebelum handler dijalankan.
connectDB(); 

const handler = NextAuth({
    session: {
        strategy: "jwt",
    },
    
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],

    // **PENTING: Menggunakan Mongoose Adapter**
    // Kita harus mendapatkan model User yang sudah ada dari Mongoose.
    adapter: MongooseAdapter(User), 

    secret: process.env.NEXTAUTH_SECRET,
    
    pages: {
        signIn: '/auth/login', 
    },

    // Callback dan konfigurasi lainnya dapat ditambahkan di sini
});

export { handler as GET, handler as POST };