// models/Activity.ts
import mongoose, { Schema, Document, models } from "mongoose";

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  metadata?: any;
  ip?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

const ActivitySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // contoh: LOGIN, VIEW_DASHBOARD, VIEW_FINANCE
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

const Activity =
  models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);

export default Activity;
