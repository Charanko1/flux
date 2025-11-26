"use client";

import React, { useState } from 'react';

// --- Komponen Ikon (Dikasih tipe props biar aman) ---
const IconChevronLeft = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const IconChevronRight = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

// --- Komponen Widget Kalender ---
const CalendarWidget = () => {
  // --- State ---
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // --- Konstanta ---
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const today = new Date();

  // --- Logika Pembuatan Kalender ---
  // FIX: Tambahkan ': Date' disini
  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dates: (number | null)[] = []; // Kasih tau array isinya angka atau null

    for (let i = 0; i < firstDayOfMonth; i++) {
      dates.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(i);
    }
    
    let totalCells = firstDayOfMonth + daysInMonth > 35 ? 42 : 35;
    while (dates.length < totalCells) {
       dates.push(null);
    }
    
    return dates;
  };

  const calendarDates = generateCalendarDays(currentDate);

  // --- Event Handlers ---
  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // FIX: Tambahkan tipe data ': number | null'
  const handleDateClick = (day: number | null) => {
    if (!day) return; 
    const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newSelectedDate);
  };

  // --- Fungsi Helper untuk Styling ---
  // FIX: Tambahkan tipe data ': number | null'
  const getDayClass = (day: number | null) => {
    if (!day) return 'text-transparent'; 

    const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    const isSelected = cellDate.toDateString() === selectedDate?.toDateString();
    if (isSelected) return 'bg-gray-900 text-white'; 

    const isToday = cellDate.toDateString() === today.toDateString();
    if (isToday) return 'bg-gray-100 text-gray-700'; 

    return 'text-gray-700 hover:bg-gray-100';
  };

  // --- Render ---
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 max-w-xs mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-800">
          {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
        </h4>
        <div className="flex space-x-2">
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
        {days.map(day => (
          <div key={day} className="font-medium text-gray-500">{day}</div>
        ))}
        
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