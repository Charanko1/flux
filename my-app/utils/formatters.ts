// File: utils/formatters.ts

export const formatCurrencyHistory = (amount: number): string => {
  // Menggunakan Intl.NumberFormat bawaan browser untuk format Indonesia
  // Hasil: 50000 -> "50.000"
  return new Intl.NumberFormat('id-ID').format(amount);
};

// Opsional: Kalau butuh format lengkap dengan "Rp"
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};