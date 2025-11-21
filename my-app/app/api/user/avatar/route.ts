// app/api/user/avatar/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { IncomingForm } from "formidable";

// Note: App Router Request is a Web Request. We still use formidable by casting to any when parsing.
// This is a pragmatic approach used often for Next.js App Router file uploads.

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), "public", "uploads");

// ensure upload dir exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// wrapper untuk formidable parse
function parseForm(req: Request): Promise<{ fields: any; files: any }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ multiples: false, keepExtensions: true, uploadDir });
    // @ts-ignore - formidable expects a Node IncomingMessage; Next's Request must be cast
    form.parse(req as any, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export async function POST(req: Request) {
  try {
    // Optional: ambil token untuk verifikasi (sesuaikan jika perlu)
    // const token = req.headers.get("authorization")?.replace("Bearer ", "");
    // TODO: verify token/session & get userId jika mau update DB di server

    const { files } = await parseForm(req);

    // formidable may store file in files.avatar (based on field name) or other key
    const fileCandidate = files?.avatar || files?.file || Object.values(files)[0];
    if (!fileCandidate) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileObj: any = Array.isArray(fileCandidate) ? fileCandidate[0] : fileCandidate;

    // formidable v2 uses filepath
    const tempPath = fileObj.filepath || fileObj.filepath || fileObj.path;
    const originalName = fileObj.originalFilename || fileObj.originalFilename || fileObj.name || "avatar";

    if (!tempPath || !fs.existsSync(tempPath)) {
      return NextResponse.json({ error: "Uploaded file missing" }, { status: 500 });
    }

    // basic validation (MIME ext check)
    const allowed = [".jpg", ".jpeg", ".png", ".gif"];
    const ext = path.extname(originalName).toLowerCase() || path.extname(tempPath).toLowerCase();
    if (!allowed.includes(ext)) {
      // cleanup temp
      try { fs.unlinkSync(tempPath); } catch (_) {}
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    // limit size check (2MB)
    const stats = fs.statSync(tempPath);
    const maxSize = 2 * 1024 * 1024;
    if (stats.size > maxSize) {
      try { fs.unlinkSync(tempPath); } catch (_) {}
      return NextResponse.json({ error: "File too large. Max 2MB" }, { status: 400 });
    }

    // create unique filename and move file to public/uploads
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const destPath = path.join(uploadDir, filename);

    fs.renameSync(tempPath, destPath);

    // Build public URL
    // If you want absolute URL, set BASE_URL in .env.local (e.g. http://localhost:3000)
    const baseUrl = process.env.BASE_URL?.replace(/\/$/, "") ?? "";
    const avatarUrl = baseUrl ? `${baseUrl}/uploads/${filename}` : `/uploads/${filename}`;

    // If you want to update DB, do it here (requires token verification)
    // Example: await prisma.user.update({ where: { id: userId }, data: { avatarUrl } });

    return NextResponse.json({ avatarUrl });
  } catch (err: any) {
    console.error("avatar upload error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
