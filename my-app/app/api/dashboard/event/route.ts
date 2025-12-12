import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event'; // Pastikan model ini sudah update (lihat langkah 2)
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Helper Auth: Cek siapa yang login
async function getUserIdFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  try {
    const secret = process.env.JWT_SECRET || "";
    const decoded: any = jwt.verify(token, secret);
    return decoded.id;
  } catch (error) {
    return null;
  }
}

// 1. GET: Ambil Event User
export async function GET() {
  try {
    await connectDB();
    const userId = await getUserIdFromSession();
    
    // Keamanan: Kalau belum login, tolak
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const events = await Event.find({ userId }).sort({ date: 1 });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

// 2. POST: Simpan Event Baru
export async function POST(request: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    
    // Validasi Field Wajib
    if (!body.title || !body.date) {
       return NextResponse.json({ error: 'Judul dan Tanggal wajib diisi' }, { status: 400 });
    }

    const newEvent = await Event.create({
      userId,
      ...body
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error create event:", error);
    return NextResponse.json({ error: 'Gagal menyimpan event' }, { status: 500 });
  }
}

// 3. PUT: Edit Event
export async function PUT(request: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: 'ID Event diperlukan' }, { status: 400 });

    const updatedEvent = await Event.findOneAndUpdate(
      { _id: id, userId }, // Pastikan user hanya bisa edit punya sendiri
      updateData,
      { new: true }
    );

    if (!updatedEvent) return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update event' }, { status: 500 });
  }
}

// 4. DELETE: Hapus Event
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID Event diperlukan' }, { status: 400 });

    const deletedEvent = await Event.findOneAndDelete({ _id: id, userId });

    if (!deletedEvent) return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });

    return NextResponse.json({ message: 'Event berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal hapus event' }, { status: 500 });
  }
}