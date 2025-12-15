import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task, { ITask } from '@/models/Task';
import { sendEmail } from '@/lib/email';
import { getUserFromToken } from "@/lib/auth-server";
// 👇 Import Helper Notifikasi
import { createNotification } from "@/lib/notification-helper";

// Konstanta Waktu
const HOURS_TO_HIGH = 24; 
const HOURS_TO_MEDIUM = 72; 
const HOURS_TO_NOTIFY = 3; 

function calculatePriority(task: ITask) {
  const now = new Date();
  const due = new Date(task.date);
  const diffInMs = due.getTime() - now.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);

  let newPriority: 'High' | 'Medium' | 'Low' = task.priority;

  if (!task.completed) {
    if (diffInHours <= HOURS_TO_HIGH) {
      newPriority = 'High';
    } else if (diffInHours <= HOURS_TO_MEDIUM) {
      newPriority = task.priority === 'High' ? 'High' : 'Medium';
    }
  }

  return { newPriority, diffInHours };
}

// 1. GET: Ambil Task
export async function GET() {
  try {
    await connectDB();
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userEmail = user.email; 
    const tasks = await Task.find({ userId: user.id }).sort({ createdAt: -1 });

    const bulkOps = [];
    const updatedTasks = [];
    const emailPromises = [];

    for (const task of tasks) {
      const { newPriority, diffInHours } = calculatePriority(task);
      const currentPriority = task.priority;
      
      let isUpdated = false;
      let updateFields: any = {};

      if (currentPriority !== newPriority) {
        updateFields.priority = newPriority;
        task.priority = newPriority; 
        isUpdated = true;

        if (userEmail && !task.completed) {
           emailPromises.push(sendEmail(
             userEmail,
             `⚠️ Status Changed: ${task.title}`,
             `<p>Task <b>"${task.title}"</b> has changed priority from <b>${currentPriority}</b> to <b>${newPriority}</b>.</p>`
           ));
        }
      }

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
      Promise.all(emailPromises).catch(err => console.error("Email error:", err));
    }

    return NextResponse.json(updatedTasks);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

// 2. POST: Tambah Task (+ Notifikasi)
export async function POST(request: Request) {
  try {
    await connectDB();
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    if (!body.title || !body.date) {
       return NextResponse.json({ error: 'Title and Date are required' }, { status: 400 });
    }

    const newTask = await Task.create({
      userId: user.id,
      ...body,
      completed: false
    });

    // 🔔 TRIGGER NOTIFIKASI
    await createNotification(
      user.id,
      "New Task Added",
      `Task "${newTask.title}" has been successfully created.`,
      "success"
    );

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

// 3. PUT: Edit Task
export async function PUT(request: Request) {
  try {
    await connectDB();
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId: user.id },
      updateData,
      { new: true }
    );
    if (!updatedTask) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// 4. DELETE: Hapus Task
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

    const deletedTask = await Task.findOneAndDelete({ _id: id, userId: user.id });
    if (!deletedTask) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    return NextResponse.json({ message: 'Task deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}