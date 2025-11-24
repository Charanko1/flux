import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. Interface TypeScript untuk Struktur Dokumen
export interface IUser extends Document {
  name: string;
  email: string;
  password: string; 
  role: 'user' | 'admin';
  createdAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>; 
}

// 2. Definisikan Mongoose Schema
const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Nama wajib diisi.'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email wajib diisi.'],
    unique: true, 
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password wajib diisi.'],
    minlength: [6, 'Password minimal 6 karakter.'],
    select: false, // <--- PENAMBAHAN KRUSIAL INI! Sembunyikan secara default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { 
    timestamps: false 
});

// 3. MIDDLEWARE: Hashing Password Sebelum Disimpan
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// 4. METODE: Fungsi Membandingkan Password untuk Login
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  // Karena kita menggunakan .select('+password') di Login Route, 
  // this.password dijamin membawa hash dari database.
  return await bcrypt.compare(enteredPassword, this.password);
};

// 5. Ekspor Mongoose Model (Pola Next.js)
const User = (mongoose.models.User || mongoose.model<IUser>('User', UserSchema)) as Model<IUser>;

export default User;