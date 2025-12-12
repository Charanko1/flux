import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

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

export async function GET() {
  try {
    await connectDB();
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const notes = await Note.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    
    // Validasi sederhana
    if (!body.title) {
       return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const newNote = await Note.create({
      userId,
      ...body // Ini akan otomatis memasukkan title, content, color, DAN date
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error); // Cek terminal kalau masih error
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

// ... (PUT dan DELETE biarkan sama seperti sebelumnya)
export async function PUT(request: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ error: 'Note ID required' }, { status: 400 });
    const updatedNote = await Note.findOneAndUpdate({ _id: id, userId }, updateData, { new: true });
    if (!updatedNote) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    return NextResponse.json(updatedNote);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Note ID required' }, { status: 400 });
    const deletedNote = await Note.findOneAndDelete({ _id: id, userId });
    if (!deletedNote) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    return NextResponse.json({ message: 'Note deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}