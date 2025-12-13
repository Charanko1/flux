// File: app/api/notifications/route.ts

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getUserIdFromSession } from "@/lib/auth"; // atau copy helper yg sama di sini

// GET /api/notifications?type=task
export async function GET(request: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // misal ?type=task

    const query: any = { userId };
    if (type) {
      query.type = type; // "task" | "info" | "warning"
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // map ke shape yang dipakai frontend
    const result = notifications.map((n: any) => ({
      id: n._id.toString(),
      title: n.title,
      message: n.message,
      type: n.type,
      createdAt: new Date(n.createdAt).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: n.read,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// POST /api/notifications  (dipanggil dari TasksPage)
export async function POST(request: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      message,
      type = "task",
      source = "task",
      taskId,
    } = body;

    const finalMessage = message || description;

    if (!title || !finalMessage) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      );
    }

    const notif = await Notification.create({
      userId,
      title,
      message: finalMessage,
      type,
      source,
      taskId: taskId || undefined,
      read: false,
    });

    return NextResponse.json(
      {
        id: notif._id.toString(),
        title: notif.title,
        message: notif.message,
        type: notif.type,
        createdAt: notif.createdAt,
        read: notif.read,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/notifications error:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

// PUT /api/notifications  (toggle read di TaskNotifications)
export async function PUT(request: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, read } = body;
    if (!id) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 });
    }

    const update: any = {};
    if (typeof read === "boolean") {
      update.read = read;
    } else {
      // kalau tidak kirim read, toggle saja
      const notif = await Notification.findOne({ _id: id, userId });
      if (!notif) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      }
      update.read = !notif.read;
    }

    const updated = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: update },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: updated._id.toString(),
      title: updated.title,
      message: updated.message,
      type: updated.type,
      createdAt: updated.createdAt,
      read: updated.read,
    });
  } catch (error) {
    console.error("PUT /api/notifications error:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
