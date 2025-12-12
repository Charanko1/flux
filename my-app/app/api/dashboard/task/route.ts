// File: app/api/dashboard/task/route.ts

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task, { ITask } from '@/models/Task';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { sendEmail } from '@/lib/email';

// Helper Auth
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

// Konstanta Waktu
const HOURS_TO_HIGH = 24; 
const HOURS_TO_MEDIUM = 72; 
const HOURS_TO_NOTIFY = 3; 

// [PERBAIKAN] Fungsi ini sekarang SELALU mengembalikan Object yang konsisten
function calculatePriority(task: ITask) {
  const now = new Date();
  const due = new Date(task.date);
  const diffInMs = due.getTime() - now.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);

  // Default: Priority tetap sama seperti di database
  let newPriority: 'High' | 'Medium' | 'Low' = task.priority;

  // Hanya hitung logika perubahan priority JIKA tugas BELUM selesai
  if (!task.completed) {
    if (diffInHours <= HOURS_TO_HIGH) {
      newPriority = 'High';
    } else if (diffInHours <= HOURS_TO_MEDIUM) {
      // Kalau aslinya High, tetap High. Kalau Low, naik ke Medium.
      newPriority = task.priority === 'High' ? 'High' : 'Medium';
    }
  }

  // Return object yang konsisten (TypeScript Happy ✅)
  return { newPriority, diffInHours };
}

// 1. GET: Ambil Task + AUTO UPDATE + SEND NOTIFICATION
export async function GET() {
  try {
    await connectDB();
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await User.findById(userId);
    const userEmail = user?.email; 

    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });

    const bulkOps = [];
    const updatedTasks = [];
    const emailPromises = [];

    for (const task of tasks) {
      // Sekarang aman di-destructure karena return type-nya pasti object
      const { newPriority, diffInHours } = calculatePriority(task);
      const currentPriority = task.priority;
      
      let isUpdated = false;
      let updateFields: any = {};

      // --- LOGIC 1: NOTIFIKASI STATUS BERUBAH ---
      if (currentPriority !== newPriority) {
        updateFields.priority = newPriority;
        task.priority = newPriority; 
        isUpdated = true;

        if (userEmail && !task.completed) {
           emailPromises.push(sendEmail(
             userEmail,
             `⚠️ Status Changed: ${task.title}`,
             `<p>Task <b>"${task.title}"</b> has changed priority from <b>${currentPriority}</b> to <b>${newPriority}</b> due to approaching deadline.</p>`
           ));
        }
      }

      // --- LOGIC 2: NOTIFIKASI SISA 3 JAM ---
      if (diffInHours <= HOURS_TO_NOTIFY && diffInHours > 0 && !task.completed && !task.notificationSent) {
        updateFields.notificationSent = true;
        task.notificationSent = true;
        isUpdated = true;

        if (userEmail) {
          emailPromises.push(sendEmail(
            userEmail,
            `⏳ Urgent: 3 Hours Left for ${task.title}`,
            `<p>Hurry up! You have less than 3 hours to complete <b>"${task.title}"</b>.</p>`
          ));
        }
      }

      if (isUpdated) {
        bulkOps.push({
          updateOne: {
            filter: { _id: task._id },
            update: { $set: updateFields }
          }
        });
      }
      
      updatedTasks.push(task);
    }

    if (bulkOps.length > 0) {
      await Task.bulkWrite(bulkOps);
    }
    
    if (emailPromises.length > 0) {
      Promise.all(emailPromises).catch(err => console.error("Email sending error:", err));
    }

    return NextResponse.json(updatedTasks);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

// ... (Sisa function POST, PUT, DELETE biarkan sama)
export async function POST(request: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    if (!body.title || !body.date) {
       return NextResponse.json({ error: 'Title and Date are required' }, { status: 400 });
    }

    const newTask = await Task.create({
      userId,
      ...body,
      completed: false
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );
    if (!updatedTask) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromSession();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

    const deletedTask = await Task.findOneAndDelete({ _id: id, userId });
    if (!deletedTask) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    return NextResponse.json({ message: 'Task deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}