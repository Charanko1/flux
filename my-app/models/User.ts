import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. Interface untuk Methods (matchPassword)
interface IUserMethods {
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// 2. Interface Utama (Gabungan Data + Document + Methods)
export interface IUser extends Document, IUserMethods {
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  
  // Field Opsional / Baru
  username?: string;
  avatarUrl?: string;
  googleId?: string;

  // OTP & Verifikasi
  isVerified: boolean;
  otp?: string;
  otpExpires?: Date;
}

// 3. Definisi Schema
const UserSchema = new Schema<IUser>({
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
    // FIX: Menggunakan arrow function atau casting 'this' agar aman di TS
    required: function(this: any) {
        // Password wajib jika TIDAK ada googleId
        return !this.googleId; 
    },
    minlength: [6, 'Password minimal 6 karakter.'],
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  
  // Field Baru
  username: {
    type: String,
    unique: true,
    sparse: true, 
    trim: true
  },
  avatarUrl: {
    type: String, 
    default: null
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    select: false
  },

  // Verifikasi
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    select: false,
  },
  otpExpires: {
    type: Date,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { 
    timestamps: false 
});

// 4. Middleware Hash Password
UserSchema.pre('save', async function (next) {
  // Casting 'this' ke IUser agar properti dikenali TypeScript
  const user = this as IUser;

  // Jika password tidak diubah atau kosong (login google), skip hash
  if (!user.isModified('password') || !user.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (err) {
    return next(err as Error);
  }
});

// 5. Method Match Password
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  const user = this as IUser; // Explicit casting
  
  // Jika user Google (tidak punya password), return false
  if (!user.password) return false;
  
  return await bcrypt.compare(enteredPassword, user.password);
};

// 6. Export Model (Singleton Pattern untuk Next.js)
// Menggunakan 'as Model<IUser>' untuk memastikan return type benar
const User = (mongoose.models.User || mongoose.model<IUser>('User', UserSchema)) as Model<IUser>;

export default User;