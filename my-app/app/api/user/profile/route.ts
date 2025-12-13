import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// 👇 IMPORT SEMUA MODEL TERKAIT (Untuk dihapus datanya)
import Finance from "@/models/Finance";
import Task from "@/models/Task";
import Event from "@/models/Event";
import Activity from "@/models/Activity";
import Note from "@/models/Note";
import Notification from "@/models/Notification";

import { getUserFromToken } from "@/lib/auth-server";

// GET: Ambil Data User
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const userData = await getUserFromToken();

    if (!userData) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userData.id).select("-password -otp -otpExpires");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET Profile Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

// PUT: Update Profile
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    
    const userData = await getUserFromToken();

    if (!userData) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, username, avatarUrl, currentPassword, newPassword } = body;

    const user = await User.findById(userData.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update Basic Info
    if (name) user.name = name;
    if (username) user.username = username;
    if (avatarUrl) user.avatarUrl = avatarUrl; 

    // Update Password Logic
    if (newPassword && currentPassword) {
      const userWithPass = await User.findById(userData.id).select("+password");
      
      if (userWithPass && await userWithPass.matchPassword(currentPassword)) {
         user.password = newPassword; 
      } else {
         return NextResponse.json({ message: "Password lama salah!" }, { status: 400 });
      }
    }

    await user.save();

    return NextResponse.json({ 
        message: "Profile updated",
        user: {
            name: user.name,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl
        }
    });

  } catch (error: any) {
    if (error.code === 11000) {
        return NextResponse.json({ message: "Username sudah dipakai user lain." }, { status: 400 });
    }
    console.error("PUT Profile Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

// DELETE: Hapus Akun + SEMUA DATA TERKAIT (Cascade Delete)
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    
    // 1. Cek User Login
    const userData = await getUserFromToken();
    if (!userData) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = userData.id;

    // 2. 🔥 HAPUS SEMUA DATA TERKAIT DULU 🔥
    // Menggunakan Promise.all agar proses penghapusan berjalan paralel (lebih cepat)
    // Code ini akan menghapus semua dokumen di koleksi terkait yang memiliki userId tersebut
    await Promise.all([
        Finance.deleteMany({ userId: userId }),
        Task.deleteMany({ userId: userId }),
        Event.deleteMany({ userId: userId }),
        Activity.deleteMany({ userId: userId }),
        Note.deleteMany({ userId: userId }),
        Notification.deleteMany({ userId: userId })
    ]);

    // 3. Terakhir: Hapus User-nya
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Account and all associated data deleted successfully" });

  } catch (error) {
    console.error("DELETE Profile Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}