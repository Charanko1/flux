// app/api/activity/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Activity from "@/models/Activity";

type JwtPayload = {
  id: string;
  email: string;
  name: string;
};

// ambil userId dari Authorization: Bearer <token>
async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    return decoded.id;
  } catch (err) {
    return null;
  }
}

// POST /api/activity  -> simpan activity
export async function POST(req: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, metadata } = body;

    if (!action) {
      return NextResponse.json(
        { message: "Action is required" },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for") || null;
    const userAgent = req.headers.get("user-agent") || null;

    const activity = await Activity.create({
      userId,
      action,
      metadata,
      ip,
      userAgent,
    });

    return NextResponse.json(
      { message: "Activity logged", activity },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[ACTIVITY_POST_ERROR]", err);
    return NextResponse.json(
      { message: "Internal Server Error", error: err.message },
      { status: 500 }
    );
  }
}

// GET /api/activity?limit=5  -> ambil aktivitas terbaru user
export async function GET(req: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || "5");

    const activities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({ activities }, { status: 200 });
  } catch (err: any) {
    console.error("[ACTIVITY_GET_ERROR]", err);
    return NextResponse.json(
      { message: "Internal Server Error", error: err.message },
      { status: 500 }
    );
  }
}
