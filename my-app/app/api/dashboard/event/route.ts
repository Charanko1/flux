import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
// GANTI IMPORT AUTH
import { getUserFromToken } from "@/lib/auth-server";

// 1. GET: Ambil Event User
export async function GET() {
  try {
    await connectDB();
    
    // AUTH BARU
    const user = await getUserFromToken();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gunakan user.id
    const events = await Event.find({ userId: user.id }).sort({ date: 1 });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

// 2. POST: Simpan Event Baru
export async function POST(request: Request) {
  try {
    await connectDB();
    
    // AUTH BARU
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    
    if (!body.title || !body.date) {
       return NextResponse.json({ error: 'Judul dan Tanggal wajib diisi' }, { status: 400 });
    }

    const newEvent = await Event.create({
      userId: user.id, // Gunakan user.id
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
    
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: 'ID Event diperlukan' }, { status: 400 });

    const updatedEvent = await Event.findOneAndUpdate(
      { _id: id, userId: user.id }, 
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
    
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID Event diperlukan' }, { status: 400 });

    const deletedEvent = await Event.findOneAndDelete({ _id: id, userId: user.id });

    if (!deletedEvent) return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });

    return NextResponse.json({ message: 'Event berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal hapus event' }, { status: 500 });
  }
}