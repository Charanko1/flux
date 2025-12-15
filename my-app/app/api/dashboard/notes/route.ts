import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
// GANTI IMPORT AUTH
import { getUserFromToken } from "@/lib/auth-server";

export async function GET() {
  try {
    await connectDB();
    
    // AUTH BARU
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const notes = await Note.find({ userId: user.id }).sort({ createdAt: -1 });
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    
    if (!body.title) {
       return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const newNote = await Note.create({
      userId: user.id,
      ...body 
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ error: 'Note ID required' }, { status: 400 });
    
    const updatedNote = await Note.findOneAndUpdate({ _id: id, userId: user.id }, updateData, { new: true });
    if (!updatedNote) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    
    return NextResponse.json(updatedNote);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Note ID required' }, { status: 400 });
    
    const deletedNote = await Note.findOneAndDelete({ _id: id, userId: user.id });
    if (!deletedNote) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    
    return NextResponse.json({ message: 'Note deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}