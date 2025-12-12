// lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// 1. Helper standar untuk Tailwind (Jaga-jaga kalau kepakai di component lain)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Helper Smart Parsing:
 * Bisa baca format ISO Database ("2025-12-31") 
 * DAN format Indo manual ("31 Des 2025")
 */
export const parseDateIDN = (dateString: string): Date | null => {
  if (!dateString) return null;

  // --- SKENARIO 1: Format Database (YYYY-MM-DD) ---
  // Cek apakah string mengandung strip (-) seperti "2025-12-01"
  if (dateString.includes('-')) {
    const date = new Date(dateString);
    // Validasi apakah tanggal valid
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // --- SKENARIO 2: Format Manual Indo (dd MMM yyyy) ---
  const monthMap: { [key: string]: number } = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mei': 4, 'Jun': 5,
    'Jul': 6, 'Ags': 7, 'Sep': 8, 'Okt': 9, 'Nov': 10, 'Des': 11
  };
  
  const parts = dateString.split(' ');
  
  // Jika formatnya "8 Nov 2025" (3 bagian)
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = monthMap[parts[1]]; // Cari angka bulan berdasarkan nama
    const year = parseInt(parts[2], 10);
    
    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }

  console.warn("Gagal mem-parsing tanggal:", dateString);
  return null;
};