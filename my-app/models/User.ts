import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. Interface TypeScript
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
  
  // TAMBAHAN BARU
  username?: string;
  avatarUrl?: string;
  googleId?: string; // 👈 TAMBAHAN KHUSUS GOOGLE LOGIN

  // OTP & Verifikasi
  isVerified: boolean;
  otp?: string;
  otpExpires?: Date;
  
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// 2. Schema Mongoose
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
    // ⚠️ UPDATE LOGIKA VALIDASI:
    // Password hanya wajib jika user TIDAK punya googleId (Login manual)
    required: function(this: any) {
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
  
  // --- FIELD BARU ---
  username: {
    type: String,
    unique: true,
    sparse: true, // Membolehkan null/kosong di awal
    trim: true
  },
  avatarUrl: {
    type: String, // Menyimpan Base64 string atau URL Google
    default: null
  },
  // 👇 FIELD BARU GOOGLE ID
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    select: false
  },
  // ------------------

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

// 3. Middleware Hash Password
UserSchema.pre<IUser>('save', async function (next) {
  // Jika password tidak diubah (atau user login via google tanpa password), skip hashing
  if (!this.isModified('password') || !this.password) {
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

// 4. Method Match Password
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  // Jika user ini user Google (tidak punya password), return false
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = (mongoose.models.User || mongoose.model<IUser>('User', UserSchema)) as Model<IUser>;

export default User;