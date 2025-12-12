import mongoose, { Schema, Document, models, Model } from 'mongoose';

// Interface TypeScript
export interface IEvent extends Document {
  userId: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
  category: string;
  tags: string[];
  attendees: number; // Pastikan ini number
  status: 'upcoming' | 'completed' | 'cancelled';
}

// Schema Mongoose
const EventSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true }, // Field Kunci Privasi
  title: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, default: "00:00" },
  endTime: { type: String, default: "23:59" },
  location: { type: String, default: "" },
  description: { type: String, default: "" },
  category: { type: String, default: "General" },
  tags: { type: [String], default: [] },
  attendees: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['upcoming', 'completed', 'cancelled'],
    default: 'upcoming',
  }
}, { timestamps: true });

const Event: Model<IEvent> = models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;