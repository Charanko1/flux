// models/Notification.ts
import mongoose, { Schema, Document, models, model } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "task" | "info" | "warning";
  createdAt: Date;
  read: boolean;
  taskId?: mongoose.Types.ObjectId;
  source?: "task" | "finance" | "note" | "system";
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["task", "info", "warning"],
      default: "task",
    },
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    taskId: { type: Schema.Types.ObjectId, ref: "Task" },
    source: {
      type: String,
      enum: ["task", "finance", "note", "system"],
      default: "task",
    },
  },
  { timestamps: false }
);

const Notification =
  models.Notification ||
  model<INotification>("Notification", NotificationSchema);

export default Notification;
