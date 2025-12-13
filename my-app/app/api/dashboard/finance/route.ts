import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import FinanceTransaction from "@/models/Finance";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Ambil userId dari cookie "session"
async function getUserIdFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET || "";
    const decoded: any = jwt.verify(token, secret);
    return decoded.id as string;
  } catch (error) {
    return null;
  }
}

// GET /api/dashboard/finance
export async function GET(request: Request) {
  try {
    await connectDB();

    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: Silakan login dulu" },
        { status: 401 }
      );
    }

    const data = await FinanceTransaction.find({ userId }).sort({ date: -1 });

    const normalized = data.map((item: any) => {
      const rawType = (item.type || "").toString().toLowerCase();
      const normalizedType =
        rawType === "expense" ? "expense" : "income";

      return {
        ...item.toObject(),
        type: normalizedType,
        amount: Math.abs(item.amount ?? 0),
      };
    });

    return NextResponse.json(normalized);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/finance
export async function POST(request: Request) {
  try {
    await connectDB();

    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    let { title, amount, category, date, type } = body;

    const rawType = (type || "").toString().toLowerCase();
    const normalizedType =
      rawType === "expense" ? "expense" : "income";

    const numericAmount = Number(amount);
    const finalAmount = isNaN(numericAmount) ? 0 : Math.abs(numericAmount);

    const newData = await FinanceTransaction.create({
      userId,
      title,
      amount: finalAmount,
      category,
      date,
      type: normalizedType,
    });

    const responseObj = {
      ...newData.toObject(),
      type: normalizedType,
      amount: finalAmount,
    };

    return NextResponse.json(responseObj, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menyimpan data" },
      { status: 500 }
    );
  }
}
