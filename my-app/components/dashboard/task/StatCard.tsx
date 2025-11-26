import React from "react";

// 1. Definisikan tipe data props
interface StatCardProps {
  title: string;
  value: string | number;
}

// 2. Pasang interface di props komponen
export default function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="bg-white shadow-sm border border-[#E5E7EB] rounded-xl p-2 md:p-4 flex flex-col justify-center">
      <p className="text-[#6B7280] text-[10px] md:text-sm tracking-wide">{title}</p>
      <p className="text-lg md:text-2xl font-semibold mt-0 text-[#1F2937]">{value}</p>
    </div>
  );
}