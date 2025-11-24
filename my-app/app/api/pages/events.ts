// /my-app/pages/api/events.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Event from '../../../models/Event'; // Import Model Event Anda

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();
  const { method } = req;

  switch (method) {
    
    case 'GET': // Mengambil semua events (READ)
      try {
        const events = await Event.find({}); 
        res.status(200).json({ success: true, data: events });
      } catch (error) {
        // Console.error('GET events error:', error); // Untuk debugging
        res.status(400).json({ success: false, message: 'Gagal mengambil data event.' });
      }
      break;

    case 'POST': // Membuat event baru (CREATE)
      try {
        // 1. Membuat dokumen Event baru dari req.body
        const event = await Event.create(req.body); 
        
        // 2. Respon sukses 201 Created
        res.status(201).json({ success: true, data: event });

      } catch (error) {
        // 3. Respon error 400 jika ada validasi Mongoose yang gagal
        const errorMessage = (error as Error).message || 'Gagal membuat event.';
        res.status(400).json({ success: false, message: errorMessage });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}