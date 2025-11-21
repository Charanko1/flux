import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User'; // Pastikan path ini benar
import connectDB from '@/lib/mongodb'; // Pastikan path ini benar

export async function GET(request: Request) { 
  try {
    await connectDB();
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization header is missing or invalid' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Mengembalikan data dalam format { user: ... }
    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
  }
}