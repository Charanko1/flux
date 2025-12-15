import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getUserFromToken } from "@/lib/auth-server";
import mongoose from "mongoose";

// GET: Ambil Semua Notifikasi User
export async function GET() {
  try {
    await connectDB();
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 🟢 Casting ID user ke ObjectId untuk query yang lebih akurat
    const userIdObj = new mongoose.Types.ObjectId(user.id);

    const notifications = await Notification.find({ userId: userIdObj }).sort({ createdAt: -1 });
    
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetch notif:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// PUT: Tandai Semua Sebagai "Sudah Dibaca"
export async function PUT() {
  try {
    await connectDB();
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userIdObj = new mongoose.Types.ObjectId(user.id);

    await Notification.updateMany(
      { userId: userIdObj, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ message: "All marked as read" });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}