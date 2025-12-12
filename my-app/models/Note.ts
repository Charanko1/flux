import mongoose, { Schema, Document, models, Model } from 'mongoose';

// 1. Interface TypeScript
export interface INote extends Document {
  userId: string;
  title: string;
  content: string;
  category: string;
  color: string;
  date: string; // <--- WAJIB DITAMBAHKAN
}

// 2. Schema Mongoose
const NoteSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  content: { type: String, default: "" },
  category: { type: String, default: "General" },
  color: { type: String, default: "#FFFFFF" },
  
  // TAMBAHKAN INI:
  date: { type: String, required: true }, 
  
}, { timestamps: true });

// 3. Model Export
const Note: Model<INote> = models.Note || mongoose.model<INote>('Note', NoteSchema);

export default Note;