// lib/date.ts

/**
 * Mengubah format tanggal (cth: "2025-11-08") menjadi format (cth: "Nov 8, 2025")
 */
// PERBAIKAN 1: Tambahkan ': string' di sini
export const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

/**
 * Mem-parsing tanggal format Indonesia (cth: "8 Nov 2025" atau "10 Ags 2025")
 */
// PERBAIKAN 2: Tambahkan ': string' di sini juga
export const parseDateIDN = (dateString: string) => {
  const monthMap: { [key: string]: number } = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mei': 4, 'Jun': 5,
    'Jul': 6, 'Ags': 7, 'Sep': 8, 'Okt': 9, 'Nov': 10, 'Des': 11
  };
  
  const parts = dateString.split(' ');
  if (parts.length !== 3) {
    console.warn("Format tanggal tidak valid:", dateString);
    return null;
  }
  
  const day = parseInt(parts[0], 10);
  // TypeScript butuh tau kalau parts[1] pasti ada di dalam monthMap, jadi kita kasih fallback
  const month = monthMap[parts[1]]; 
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || month === undefined || isNaN(year)) {
    console.warn("Gagal mem-parsing tanggal:", dateString);
    return null;
  }
  
  return new Date(year, month, day);
};