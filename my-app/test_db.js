// /my-app/test_db.js
// Untuk menjalankan file ini, pastikan Anda telah menginstal dotenv

require('dotenv').config({ path: './.env.local' }); // Memuat .env.local
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI tidak ditemukan di .env.local!");
  process.exit(1);
}

console.log('🔗 Mencoba menghubungkan ke MongoDB...');

async function testConnection() {
  try {
    // Menghubungkan menggunakan URI dari .env.local
    await mongoose.connect(MONGODB_URI, {
      // Opsi konfigurasi yang mungkin diperlukan, tapi seringnya tidak
      // useNewUrlParser: true, 
      // useUnifiedTopology: true,
      bufferCommands: false, 
    });

    console.log('----------------------------------------------------');
    console.log('✅ KONEKSI MONGODB BERHASIL!');
    console.log(`Terhubung ke database: ${mongoose.connection.name}`);
    console.log('----------------------------------------------------');

  } catch (error) {
    console.log('----------------------------------------------------');
    console.error('❌ KONEKSI GAGAL!');
    console.error('Pesan Error:', error.message);
    console.log('----------------------------------------------------');
    
    // Memberikan petunjuk umum
    if (error.message.includes('MongooseServerSelectionError')) {
      console.log('💡 PERIKSA: 1. Koneksi internet. 2. IP Access List di MongoDB Atlas. 3. Username/Password di URI.');
    }
  } finally {
    // Penting: Tutup koneksi setelah pengujian
    await mongoose.connection.close(); 
  }
}

testConnection();