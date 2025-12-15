import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["success", "info", "warning", "error"], default: "info" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// PENTING: Cek mongoose.models dulu untuk mencegah error "OverwriteModelError" di Next.js
const Notification = mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;