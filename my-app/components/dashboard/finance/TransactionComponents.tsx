import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ChevronDown } from 'lucide-react';
// Pastikan path ini benar atau definisikan Transaction di file ini langsung jika perlu
import { formatCurrencyHistory } from "./TransactionHelpers"; 

// --- DEFINISI TIPE DATA (Biar aman & tidak perlu import) ---
export interface Transaction {
  id: string | number;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense'; // <-- INI KUNCI UTAMANYA
}

// --- STATS CARD (Tidak ada perubahan, sudah oke) ---
interface HistoryStatsCardProps {
  title: string;
  amount: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
}

export const HistoryStatsCard: React.FC<HistoryStatsCardProps> = ({ 
  title, amount, description, icon, iconBgColor, iconColor 
}) => (
  <div className="rounded-xl border border-gray-200 bg-white p-2.5 md:p-3 shadow-sm flex flex-col justify-between h-full">
    <div className="flex items-center justify-between">
      <span className="text-xs md:text-sm font-medium text-gray-500">{title}</span>
      <div className={`rounded-full p-1 ${iconBgColor} ${iconColor}`}>
        <div className="scale-90 md:scale-100 origin-center">
            {icon}
        </div>
      </div>
    </div>
    <div className="mt-1">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{amount}</h2>
      <p className="text-xs md:text-sm text-gray-500 leading-tight">{description}</p>
    </div>
  </div>
);

// --- TRANSACTION ITEM (PERBAIKAN LOGIC DI SINI) ---
interface HistoryTransactionItemProps {
  transaction: Transaction;
}

export const HistoryTransactionItem: React.FC<HistoryTransactionItemProps> = ({ transaction }) => {
  // 🔴 PERBAIKAN: Cek tipe dari field 'type', bukan dari minus/plus amount
  const isIncome = transaction.type === 'income';
  
  const amountColor = isIncome ? 'text-green-600' : 'text-red-600';
  const amountPrefix = isIncome ? '+Rp' : '-Rp';
  
  const Icon = isIncome ? ArrowUpRight : ArrowDownLeft;
  const iconBg = isIncome ? 'bg-green-100' : 'bg-red-100';
  const iconColor = isIncome ? 'text-green-600' : 'text-red-600';

  return (
    <div className="flex items-center justify-between py-2 md:py-2.5">
      <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
        <div className={`flex h-8 w-8 md:h-9 md:w-9 flex-shrink-0 items-center justify-center rounded-full ${iconBg}`}>
          <Icon className={`h-4 w-4 md:h-5 md:w-5 ${iconColor}`} />
        </div>
        
        <div className="min-w-0">
          <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate pr-2">
            {transaction.title}
          </h3>
          <p className="text-xs md:text-sm text-gray-500 truncate">
            {transaction.category} · {transaction.date}
          </p>
        </div>
      </div>
      
      <span className={`text-sm md:text-base font-semibold whitespace-nowrap ${amountColor}`}>
        {/* Pastikan formatCurrencyHistory hanya memformat angka, prefix diurus amountPrefix */}
        {amountPrefix} {formatCurrencyHistory(transaction.amount)}
      </span>
    </div>
  );
};

// --- FILTER DROPDOWN (Sudah oke) ---
interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({ options, value, onChange }) => (
  <div className="relative w-full sm:w-auto">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-8 md:h-9 w-full sm:w-auto items-center rounded-lg border border-gray-300 bg-white px-2 md:px-3 py-1 text-xs md:text-sm text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 cursor-pointer"
      style={{ minWidth: '120px' }} 
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
  </div>
);