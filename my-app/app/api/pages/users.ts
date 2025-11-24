// /my-app/pages/api/users.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb'; // <-- BARIS INI
import User from '../../../models/User'; // <-- BARIS INI
// ...

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Pastikan koneksi ke MongoDB stabil
  await dbConnect(); 

  const { method } = req;

  switch (method) {
    case 'POST': // Logika untuk membuat pengguna baru (Sign-up)
      try {
        // 2. Buat dokumen User baru. Middleware pre('save') di User.ts akan otomatis hash password.
        const user = await User.create(req.body); 
        
        // 3. Kirim respon sukses 201 Created dengan data pengguna yang baru.
        res.status(201).json({ success: true, data: user });

      } catch (error) {
        // 4. Kirim respon error 400 jika ada validasi Mongoose yang gagal (misalnya email duplikat atau field kosong)
        const errorMessage = (error as Error).message || 'Gagal membuat pengguna.';
        res.status(400).json({ success: false, message: errorMessage });
      }
      break;

    default: // Tolak metode selain POST
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}