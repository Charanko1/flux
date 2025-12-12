// File: models/User.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. Interface TypeScript untuk Struktur Dokumen
export interface IUser extends Document {
  name: string;
  email: string;
  password: string; 
  role: 'user' | 'admin';
  createdAt: Date;
  
  // --- TAMBAHAN OTP ---
  isVerified: boolean;
  otp?: string; // OTP bisa undefined/null setelah diverifikasi
  otpExpires?: Date; // Waktu kadaluarsa OTP
  // --------------------
  
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
    select: false, 
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  
  // --- FIELD BARU UNTUK VERIFIKASI EMAIL ---
  isVerified: {
    type: Boolean,
    default: false, // Default: Belum diverifikasi
  },
  otp: {
    type: String,
    select: false, // Sembunyikan kode OTP secara default
  },
  otpExpires: {
    type: Date,
    select: false, // Sembunyikan waktu kadaluarsa OTP
  },
  // -----------------------------------------
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { 
    timestamps: false 
});

// 3. MIDDLEWARE: Hashing Password Sebelum Disimpan
UserSchema.pre<IUser>('save', async function (next) {
  // Hanya jalankan jika password yang dimodifikasi (atau saat register)
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
  return await bcrypt.compare(enteredPassword, this.password);
};

// 5. Ekspor Mongoose Model (Pola Next.js)
const User = (mongoose.models.User || mongoose.model<IUser>('User', UserSchema)) as Model<IUser>;

export default User;