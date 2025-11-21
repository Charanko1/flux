import mongoose, { Schema, Document, models, Model } from 'mongoose';

// Interface untuk TypeScript (cocok dengan EventType di frontend)
export interface IEvent extends Document {
  _id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  price: string;
}

// Skema Mongoose
const EventSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the event.'],
  },
  date: {
    type: String,
    required: [true, 'Please provide a date for the event.'],
  },
  time: {
    type: String,
    required: [true, 'Please provide a time for the event.'],
  },
  price: {
    type: String,
    default: '0',
  },
}, {
  timestamps: true, // Menambahkan createdAt dan updatedAt
});

// Mencegah model di-compile ulang jika sudah ada (Best practice di Next.js)
const Event: Model<IEvent> = models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;