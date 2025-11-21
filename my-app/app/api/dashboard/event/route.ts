import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb'; // <-- GANTI
import Event from '@/models/Event'; // <-- GANTI
// HAPUS: import { events, EventType } from '@/lib/db';

// Helper otentikasi (masih placeholder)
const checkAuth = (req: NextRequest) => {
  const authHeader = req.headers.get('authorization');
  return authHeader === 'Bearer fake-token';
};

// ======================================================
// KASUS: GET /api/dashboard/event (Ambil semua event dari MongoDB)
// ======================================================
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB(); // Hubungkan ke DB

    // Ambil semua event, urutkan dari yang terbaru (bisa diganti)
    const events = await Event.find({}).sort({ date: 'asc' }); 

    return NextResponse.json({ events: events });

  } catch (error) {
    console.error(error); // Tampilkan error di server log
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// ======================================================
// KASUS: POST /api/dashboard/event (Buat event baru di MongoDB)
// ======================================================
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB(); // Hubungkan ke DB

    const { title, date, time, price } = await req.json();

    if (!title || !date || !time) {
      return NextResponse.json({ message: 'Title, date, and time are required' }, { status: 400 });
    }

    // Buat event baru menggunakan Model
    const newEvent = new Event({
      title,
      date,
      time,
      price: price || '0',
    });

    // Simpan ke database
    await newEvent.save();

    return NextResponse.json({ event: newEvent }, { status: 201 });

  } catch (error) {
    console.error(error); // Tampilkan error di server log
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}