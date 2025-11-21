"use client" 
// "test"

import React, { useState } from 'react';

// --- Komponen Ikon ---
const IconChevronLeft = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const IconChevronRight = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

// --- Komponen Widget Kalender (Fungsional) ---
const CalendarWidget = () => {
  // --- State ---
  // State untuk menyimpan tanggal yang sedang ditampilkan (bulan & tahun)
  const [currentDate, setCurrentDate] = useState(new Date());
  // State untuk menyimpan tanggal yang dipilih oleh pengguna
  const [selectedDate, setSelectedDate] = useState(new Date());

  // --- Konstanta ---
  // Nama hari (versi Indonesia)
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  // Simpan tanggal hari ini untuk perbandingan
  const today = new Date();

  // --- Logika Pembuatan Kalender ---
  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Cari tahu hari apa tanggal 1 dimulai (0 = Minggu, 1 = Senin, dst.)
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    // Cari tahu jumlah hari di bulan ini
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dates = [];

    // Tambahkan 'null' untuk sel kosong sebelum tanggal 1
    for (let i = 0; i < firstDayOfMonth; i++) {
      dates.push(null);
    }

    // Tambahkan semua hari di bulan ini (1, 2, 3, ...)
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(i);
    }
    
    // Isi sisa grid dengan 'null' agar rapi (total 35 atau 42 sel)
    let totalCells = firstDayOfMonth + daysInMonth > 35 ? 42 : 35;
    while (dates.length < totalCells) {
       dates.push(null);
    }
    
    return dates;
  };

  // Buat array tanggal untuk bulan ini
  const calendarDates = generateCalendarDays(currentDate);

  // --- Event Handlers ---
  // Fungsi untuk pindah ke bulan sebelumnya
  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Fungsi untuk pindah ke bulan berikutnya
  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Fungsi untuk menangani klik pada tanggal
  const handleDateClick = (day) => {
    if (!day) return; // Jangan lakukan apa-apa jika sel kosong (null) diklik
    const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newSelectedDate);
    // Di aplikasi nyata, Anda mungkin ingin memanggil fungsi prop di sini
    //
    // z.B. props.onDateSelect(newSelectedDate);
  };

  // --- Fungsi Helper untuk Styling ---
  const getDayClass = (day) => {
    if (!day) return 'text-transparent'; // Sel kosong

    const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    // Cek apakah tanggal ini yang dipilih
    const isSelected = cellDate.toDateString() === selectedDate?.toDateString();
    if (isSelected) return 'bg-gray-900 text-white'; // Style untuk tanggal terpilih

    // Cek apakah tanggal ini adalah hari ini
    const isToday = cellDate.toDateString() === today.toDateString();
    if (isToday) return 'bg-gray-100 text-gray-700'; // Style untuk hari ini

    // Style default
    return 'text-gray-700 hover:bg-gray-100';
  };

  // --- Render ---
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 max-w-xs mx-auto">
      {/* Header: Nama Bulan & Tombol Navigasi */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-800">
          {/* Tampilkan Bulan & Tahun secara dinamis (Bahasa Indonesia) */}
          {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
        </h4>
        <div className="flex space-x-2">
          {/* Tombol fungsional */}
          <button onClick={prevMonth} className="text-gray-400 hover:text-gray-600 rounded-full p-1">
            <IconChevronLeft />
          </button>
          <button onClick={nextMonth} className="text-gray-400 hover:text-gray-600 rounded-full p-1">
            <IconChevronRight />
          </button>
        </div>
      </div>
      
      {/* Grid Kalender */}
      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {/* Header Nama Hari */}
        {days.map(day => (
          <div key={day} className="font-medium text-gray-500">{day}</div>
        ))}
        
        {/* Tanggal-Tanggal (Dinamis) */}
        {calendarDates.map((date, index) => (
          <div
            key={index}
            className={`p-1 rounded-full ${date ? 'cursor-pointer' : ''} ${getDayClass(date)} transition-colors`}
            onClick={() => handleDateClick(date)}
          >
            {date}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWidget;