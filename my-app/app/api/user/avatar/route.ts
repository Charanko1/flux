// /app/api/user/avatar/route.ts

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { IncomingForm } from "formidable";
// Import Stream untuk membantu parsing Request
import { Readable } from 'stream'; 

// --- 🛑 Next.js App Router tidak menggunakan 'export const config' ini ---
// const config = { api: { bodyParser: false, }, }; 

const uploadDir = path.join(process.cwd(), "public", "uploads");

// Pastikan direktori uploads ada (Dijalankan saat server build/start)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper: Mengubah Web Request Body menjadi Node Stream
function bufferToStream(buffer: Buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null); // Menandakan akhir stream
  return stream;
}

// Wrapper untuk formidable parse
async function parseForm(req: Request): Promise<{ fields: any; files: any }> {
  // Ambil body sebagai buffer
  const buffer = Buffer.from(await req.arrayBuffer()); 
  const stream = bufferToStream(buffer);

  return new Promise((resolve, reject) => {
    // Setting formidable
    const form = new IncomingForm({ 
      multiples: false, 
      keepExtensions: true, 
      uploadDir 
    });

    // Parsing stream
    // @ts-ignore - Karena formidable expects Node's IncomingMessage, kita menggunakan stream
    form.parse(stream as any, (err, fields, files) => { 
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}


export async function POST(req: Request) {
  try {
    // --- AUTENTIKASI PLACEHOLDER (Wajib di endpoint user) ---
    // Di sini Anda perlu memverifikasi JWT dan mendapatkan userId
    /*
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const userId = verifyTokenAndGetUserId(token); // Anda harus implementasi fungsi ini
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    */
    // --- AKHIR AUTENTIKASI ---


    const { files } = await parseForm(req);

    // Dapatkan file dari field yang diupload (asumsi field name: 'avatar' atau 'file')
    const fileCandidate = files.avatar || files.file || Object.values(files)[0];

    if (!fileCandidate) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Normalisasi file object
    const fileObj: any = Array.isArray(fileCandidate) ? fileCandidate[0] : fileCandidate;

    // Ambil path sementara (formidable v3 menggunakan filepath)
    const tempPath = fileObj.filepath; 
    const originalName = fileObj.originalFilename || "avatar";

    if (!tempPath || !fs.existsSync(tempPath)) {
      return NextResponse.json({ error: "Uploaded file missing or failed to save" }, { status: 500 });
    }

    // 1. Validasi Ekstensi
    const allowed = [".jpg", ".jpeg", ".png", ".gif"];
    const ext = path.extname(originalName).toLowerCase();
    
    if (!allowed.includes(ext)) {
      try { fs.unlinkSync(tempPath); } catch (_) {}
      return NextResponse.json({ error: "Unsupported file type. Allowed: JPG, PNG, GIF" }, { status: 400 });
    }

    // 2. Validasi Ukuran (Max 2MB)
    const stats = fs.statSync(tempPath);
    const maxSize = 2 * 1024 * 1024; 
    if (stats.size > maxSize) {
      try { fs.unlinkSync(tempPath); } catch (_) {}
      return NextResponse.json({ error: "File too large. Max 2MB" }, { status: 400 });
    }

    // 3. Pindahkan File ke Lokasi Permanen
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const destPath = path.join(uploadDir, filename);

    fs.renameSync(tempPath, destPath);

    // 4. Build URL Publik
    const baseUrl = process.env.BASE_URL?.replace(/\/$/, "") ?? "";
    const avatarUrl = baseUrl ? `${baseUrl}/uploads/${filename}` : `/uploads/${filename}`;

    // --- UPDATE DATABASE MONGODB DI SINI ---
    /*
    // Contoh update MongoDB (membutuhkan userId dari otentikasi)
    import connectDB from "@/lib/mongodb";
    import User from "@/models/User";
    await connectDB();
    await User.findByIdAndUpdate(userId, { avatarUrl }, { new: true });
    */
    // --- AKHIR UPDATE DATABASE ---

    return NextResponse.json({ avatarUrl });
  } catch (err: any) {
    console.error("avatar upload error:", err);
    // Jika error dari formidable, seringkali itu masalah parsing
    return NextResponse.json({ error: err?.message || "Server error during file parsing" }, { status: 500 });
  }
}