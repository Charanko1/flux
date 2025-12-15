import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import FinanceTransaction from "@/models/Finance";
import { getUserFromToken } from "@/lib/auth-server";
// 👇 Import Helper Notifikasi
import { createNotification } from "@/lib/notification-helper";

export async function GET(request: Request) {
  try {
    await connectDB();
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Silakan login dulu" }, { status: 401 });
    }

    const data = await FinanceTransaction.find({ userId: user.id }).sort({ date: -1 });

    const normalized = data.map((item: any) => {
      const rawType = (item.type || "").toString().toLowerCase();
      const normalizedType = rawType === "expense" ? "expense" : "income";

      return {
        ...item.toObject(),
        type: normalizedType,
        amount: Math.abs(item.amount ?? 0),
      };
    });

    return NextResponse.json(normalized);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// POST: Tambah Transaksi (+ Notifikasi)
export async function POST(request: Request) {
  try {
    await connectDB();
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    let { title, amount, category, date, type } = body;

    const rawType = (type || "").toString().toLowerCase();
    const normalizedType = rawType === "expense" ? "expense" : "income";
    const numericAmount = Number(amount);
    const finalAmount = isNaN(numericAmount) ? 0 : Math.abs(numericAmount);

    const newData = await FinanceTransaction.create({
      userId: user.id,
      title,
      amount: finalAmount,
      category,
      date,
      type: normalizedType,
    });

    // 🔔 TRIGGER NOTIFIKASI
    await createNotification(
      user.id,
      "Finance Transaction Added",
      `Successfully added ${normalizedType}: "${title}" (${finalAmount}).`,
      "success"
    );

    const responseObj = {
      ...newData.toObject(),
      type: normalizedType,
      amount: finalAmount,
    };

    return NextResponse.json(responseObj, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: "ID Transaksi diperlukan" }, { status: 400 });

    if (updateData.type) {
        updateData.type = updateData.type.toString().toLowerCase() === "expense" ? "expense" : "income";
    }
    if (updateData.amount !== undefined) {
        const num = Number(updateData.amount);
        updateData.amount = isNaN(num) ? 0 : Math.abs(num);
    }

    const updatedData = await FinanceTransaction.findOneAndUpdate(
      { _id: id, userId: user.id },
      updateData,
      { new: true }
    );

    if (!updatedData) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });

    return NextResponse.json(updatedData);
  } catch (error) {
    return NextResponse.json({ error: "Gagal update data" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID Transaksi diperlukan" }, { status: 400 });

    const deletedData = await FinanceTransaction.findOneAndDelete({ _id: id, userId: user.id });

    if (!deletedData) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });

    return NextResponse.json({ message: "Data berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal hapus data" }, { status: 500 });
  }
}