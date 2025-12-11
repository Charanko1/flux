// File: app/api/finance/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import FinanceTransaction from '@/models/Finance';
import jwt from 'jsonwebtoken'; // Pastikan install: npm i jsonwebtoken @types/jsonwebtoken
import { cookies } from 'next/headers'; // Cara baca cookie di Next.js App Router

// Helper function untuk cek user dari token
async function getUserIdFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value; // Sesuai nama cookie di login Anda ('session')

  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET || "";
    // Decode token untuk ambil data user
    const decoded: any = jwt.verify(token, secret);
    return decoded.id; // Sesuai payload login Anda: { id: user._id, ... }
  } catch (error) {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();

    // 1. AMBIL ID USER ASLI DARI COOKIE
    const userId = await getUserIdFromSession();

    // 2. JIKA BELUM LOGIN / TOKEN INVALID
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Silakan login dulu' }, { status: 401 });
    }

    // 3. AMBIL DATA MILIK USER TERSEBUT SAJA
    const data = await FinanceTransaction.find({ userId }).sort({ date: -1 });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    // 1. AMBIL ID USER ASLI
    const userId = await getUserIdFromSession();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, amount, category, date, type } = body;

    // 2. SIMPAN DENGAN ID USER YANG SEDANG LOGIN
    const newData = await FinanceTransaction.create({
      userId, // <-- User ID otomatis terisi
      title,
      amount,
      category,
      date,
      type
    });

    return NextResponse.json(newData, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan data' }, { status: 500 });
  }
}