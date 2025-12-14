import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

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

    const user = await User.findById(userData.id).select(
      "-password -otp -otpExpires"
    );
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET Profile Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

// PUT: Update Profile (nama, username, avatar, password)
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const userData = await getUserFromToken();
    if (!userData) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Wrap req.json() dalam try-catch untuk menangani payload yang terlalu besar/error parsing
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { message: "Data terlalu besar atau format salah." },
        { status: 400 }
      );
    }

    const { name, username, avatarUrl, currentPassword, newPassword } = body;

    const user = await User.findById(userData.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update Basic Info
    if (name) user.name = name;
    if (username) user.username = username;
    
    // Update Avatar (sekarang menerima string base64 yang sudah dikompres)
    if (avatarUrl) user.avatarUrl = avatarUrl;

    // Update Password Logic
    if (newPassword && currentPassword) {
      const userWithPass = await User.findById(userData.id).select("+password");

      if (userWithPass && (await userWithPass.matchPassword(currentPassword))) {
        user.password = newPassword;
      } else {
        return NextResponse.json(
          { message: "Password lama salah!" },
          { status: 400 }
        );
      }
    }

    await user.save();

    const tokenPayload = {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role || "user",
    };

    const newToken = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    const response = NextResponse.json({
      message: "Profile updated",
      user: tokenPayload,
    });

    response.cookies.set("session", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Username sudah dipakai user lain." },
        { status: 400 }
      );
    }
    console.error("PUT Profile Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

// DELETE: Hapus Akun
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const userData = await getUserFromToken();
    if (!userData) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = userData.id;

    await Promise.all([
      Finance.deleteMany({ userId }),
      Task.deleteMany({ userId }),
      Event.deleteMany({ userId }),
      Activity.deleteMany({ userId }),
      Note.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
    ]);

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const response = NextResponse.json({
      message: "Account and all associated data deleted successfully",
    });
    response.cookies.set("session", "", { maxAge: 0, path: "/" });

    return response;
  } catch (error) {
    console.error("DELETE Profile Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}