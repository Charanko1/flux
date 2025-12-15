import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import FinanceTransaction from "@/models/Finance";
// GANTI IMPORT AUTH
import { getUserFromToken } from "@/lib/auth-server";

// GET /api/dashboard/finance
export async function GET(request: Request) {
  try {
    await connectDB();

    // AUTH BARU
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Silakan login dulu" },
        { status: 401 }
      );
    }

    const data = await FinanceTransaction.find({ userId: user.id }).sort({ date: -1 });

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

    // AUTH BARU
    const user = await getUserFromToken();
    if (!user) {
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
      userId: user.id, // Gunakan user.id
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