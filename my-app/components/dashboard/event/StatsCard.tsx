// components/dashboard/event/StatsCard.jsx
import React from 'react';

const StatsCard = ({ title, value, icon, iconBg, change }) => (
  <div className="p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-100 h-full">
    <div className="flex justify-between items-start">
      <div className="min-w-0"> {/* min-w-0 mencegah teks judul nabrak icon */}
        
        {/* JUDUL: text-xs (kecil) di HP, text-sm (normal) di Desktop */}
        <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">
          {title}
        </h3>
        
        {/* ANGKA: text-xl (sedang) di HP, text-3xl (besar) di Desktop */}
        <p className="text-xl sm:text-3xl font-bold text-gray-800 mt-1">
          {value}
        </p>
      </div>

      {/* ICON: Padding lebih kecil di HP, shrink-0 biar gak gepeng */}
      <div className={`p-1.5 sm:p-2 rounded-lg ${iconBg} shrink-0 ml-2`}>
        {/* Pakai wrapper ini biar ukuran icon svg ngikutin, gak kegedean */}
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