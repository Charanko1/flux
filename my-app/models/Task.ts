import mongoose, { Schema, Document, models, Model } from 'mongoose';

// 1. Interface TypeScript
export interface ITask extends Document {
  userId: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  date: string; // YYYY-MM-DD
  category: string;
  description?: string;
  // [UPDATE] Tambahan field baru untuk mencegah spam email
  notificationSent: boolean; 
}

// 2. Schema Mongoose
const TaskSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['High', 'Medium', 'Low'], 
    default: 'Medium' 
  },
  completed: { type: Boolean, default: false },
  date: { type: String, required: true },
  category: { type: String, default: 'General' },
  description: { type: String, default: '' },
  // [UPDATE] Default false (artinya belum dikirim notifikasi 3 jam)
  notificationSent: { type: Boolean, default: false }, 
}, { timestamps: true });

// 3. Model Export
const Task: Model<ITask> = models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;