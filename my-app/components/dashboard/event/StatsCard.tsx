import React from 'react';

// 1. Definisikan tipe data Props
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  change?: string; // Tanda tanya (?) artinya opsional (boleh ada, boleh tidak)
}

// 2. Pasang Interface di sini
const StatsCard = ({ title, value, icon, iconBg, change }: StatsCardProps) => (
  <div className="p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-100 h-full">
    <div className="flex justify-between items-start">
      <div className="min-w-0"> {/* min-w-0 mencegah teks judul nabrak icon */}
        
        {/* JUDUL */}
        <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">
          {title}
        </h3>
        
        {/* ANGKA */}
        <p className="text-xl sm:text-3xl font-bold text-gray-800 mt-1">
          {value}
        </p>
      </div>

      {/* ICON */}
      <div className={`p-1.5 sm:p-2 rounded-lg ${iconBg} shrink-0 ml-2`}>
        {/* Wrapper icon agar ukurannya pas */}
        <div className="w-4 h-4 sm:w-6 sm:h-6 [&>svg]:w-full [&>svg]:h-full">
          {icon}
        </div>
      </div>
    </div>

    {change && (
      <p className="text-[10px] sm:text-xs text-green-600 mt-1 sm:mt-2">
        {change}
      </p>
    )}
  </div>
);

export default StatsCard;