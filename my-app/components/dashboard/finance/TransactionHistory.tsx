"use client";

import React, { useState } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Filter,
  ChevronDown,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

// ==================================================================
// COMPONENT HELPERS
// ==================================================================

const parseDateIDN = (dateString) => {
  if (!dateString) return null;
  let date = new Date(dateString);
  if (!isNaN(date.getTime())) return date;

  const monthsMap = {
    'januari': 'January', 'februari': 'February', 'maret': 'March', 
    'april': 'April', 'mei': 'May', 'juni': 'June', 
    'juli': 'July', 'agustus': 'August', 'september': 'September', 
    'oktober': 'October', 'november': 'November', 'desember': 'December',
    'jan': 'January', 'feb': 'February', 'mar': 'March', 'apr': 'April',
    'jun': 'June', 'jul': 'July', 'agu': 'August', 'agt': 'August',
    'sep': 'September', 'sept': 'September', 'okt': 'October', 'oct': 'October',
    'nov': 'November', 'des': 'December', 'dec': 'December'
  };

  let englishDateStr = dateString.toLowerCase();
  for (const [key, value] of Object.entries(monthsMap)) {
    if (englishDateStr.includes(key)) {
      englishDateStr = englishDateStr.replace(key, value);
      break;
    }
  }
  date = new Date(englishDateStr);
  return isNaN(date.getTime()) ? null : date;
};

const formatCurrencyHistory = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(Math.abs(amount));
};

const getMonthYear = (dateString) => {
  try {
    const date = parseDateIDN(dateString);
    if (!date) return ''; 
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  } catch (e) {
    return '';
  }
};

// UBAHAN: Kotak Stats Jadi Mungil
const HistoryStatsCard = ({ title, amount, description, icon, iconBgColor, iconColor }) => (
  // p-2.5 (padding tipis banget biar kotak jadi kecil)
  <div className="rounded-xl border border-gray-200 bg-white p-2.5 md:p-3 shadow-sm flex flex-col justify-between h-full">
    <div className="flex items-center justify-between">
      <span className="text-xs md:text-sm font-medium text-gray-500">{title}</span>
      {/* Padding icon container dikurangi jadi p-1 */}
      <div className={`rounded-full p-1 ${iconBgColor} ${iconColor}`}>
        <div className="scale-90 md:scale-100 origin-center">
            {icon}
        </div>
      </div>
    </div>
    {/* Margin top dikurangi jadi mt-1 biar angka naik ke atas */}
    <div className="mt-1">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{amount}</h2>
      <p className="text-xs md:text-sm text-gray-500 leading-tight">{description}</p>
    </div>
  </div>
);

const HistoryTransactionItem = ({ transaction }) => {
  const isIncome = transaction.amount >= 0;
  const amountColor = isIncome ? 'text-green-600' : 'text-red-600';
  const amountPrefix = isIncome ? '+Rp' : '-Rp';
  const Icon = isIncome ? ArrowUpRight : ArrowDownLeft;
  const iconBg = isIncome ? 'bg-green-100' : 'bg-red-100';
  const iconColor = isIncome ? 'text-green-600' : 'text-red-600';

  return (
    // py-2 (List item tetep rapet)
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
        {amountPrefix} {formatCurrencyHistory(transaction.amount)}
      </span>
    </div>
  );
};

const FilterDropdown = ({ options, value, onChange }) => (
  <div className="relative w-full sm:w-auto">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      // h-8 (Tinggi dropdown dikurangi dikit biar mungil)
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

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export default function TransactionHistoryPage({ onBack, transactions }) {

  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');

  // Statistics Calculation
  const totalIncome = transactions
    .filter(tx => tx.amount > 0)
    .reduce((acc, tx) => acc + tx.amount, 0);
  const totalExpense = transactions
    .filter(tx => tx.amount < 0)
    .reduce((acc, tx) => acc + tx.amount, 0);

  const countIncome = transactions.filter(tx => tx.amount > 0).length;
  const countExpense = transactions.filter(tx => tx.amount < 0).length;

  // 1. Options: Type
  const typeOptions = [
    { value: 'all', label: 'All Type' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' }
  ];

  // 2. Options: Category
  const categoryOptions = [
    { value: 'all', label: 'All Category' },
    ...[...new Set(transactions.map(tx => tx.category))]
      .sort()
      .map(cat => ({ value: cat, label: cat }))
  ];

  // 3. Options: Month
  const sortedTxForMonths = [...transactions].sort((a, b) => {
    const dateA = parseDateIDN(a.date);
    const dateB = parseDateIDN(b.date);
    const timeA = dateA ? dateA.getTime() : 0;
    const timeB = dateB ? dateB.getTime() : 0;
    return timeB - timeA;
  });
  
  const uniqueMonths = [...new Set(
    sortedTxForMonths
      .map(tx => getMonthYear(tx.date))
      .filter(m => m !== '') 
  )];
  
  const monthOptions = [
    { value: 'all', label: 'All Months' },
    ...uniqueMonths.map(m => ({ value: m, label: m }))
  ];

  // Filter Logic
  const filteredTransactions = transactions
    .filter(tx => {
      const typeMatch = filterType === 'all' ||
                        (filterType === 'income' && tx.amount >= 0) ||
                        (filterType === 'expense' && tx.amount < 0);
      
      const categoryMatch = filterCategory === 'all' || tx.category === filterCategory;

      const monthMatch = filterMonth === 'all' || getMonthYear(tx.date) === filterMonth;

      return typeMatch && categoryMatch && monthMatch;
    })
    .sort((a, b) => {
      const dateA = parseDateIDN(a.date);
      const dateB = parseDateIDN(b.date);
      const timeA = dateA ? dateA.getTime() : 0;
      const timeB = dateB ? dateB.getTime() : 0;
      return timeB - timeA;
    });
  
  return (
    <div className="bg-gray-100 font-inter min-h-screen w-full">
      {/* Padding main container dikecilin p-3 */}
      <main className="p-3 md:p-5 w-full">
        
        {/* Back Button */}
        <div className="mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Page Header */}
        <div className="mb-3">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-0.5">See all your financial activities</p>
        </div>

        {/* Stats Cards */}
        {/* Gap antar card cuma gap-2 */}
        <div className="mb-3 grid grid-cols-1 gap-2 md:gap-3 md:grid-cols-3">
          <HistoryStatsCard
            title="Total Income"
            amount={`Rp ${formatCurrencyHistory(totalIncome)}`}
            description={`${countIncome} transactions`}
            icon={<TrendingUp className="h-4 w-4 md:h-5 md:w-5" />}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <HistoryStatsCard
            title="Total Expense"
            amount={`Rp ${formatCurrencyHistory(totalExpense)}`}
            description={`${countExpense} transactions`}
            icon={<TrendingDown className="h-4 w-4 md:h-5 md:w-5" />}
            iconBgColor="bg-red-100"
            iconColor="text-red-600"
          />
          <HistoryStatsCard
            title="Total Transactions"
            amount={transactions.length.toString()}
            description="All time"
            icon={<CalendarDays className="h-4 w-4 md:h-5 md:w-5" />}
            iconBgColor="bg-gray-100"
            iconColor="text-gray-600"
          />
        </div>

        {/* Transaction List Container */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          
          {/* Filter Header Section */}
          {/* Padding header p-3 */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 border-b border-gray-200 p-3 md:p-4">
            <div className="flex items-center gap-2 mb-1 lg:mb-0">
              <Filter className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
              <span className="text-sm md:text-base font-semibold text-gray-700">Filter:</span>
            </div>
            
            <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
              <FilterDropdown
                options={typeOptions}
                value={filterType}
                onChange={setFilterType}
              />
              <FilterDropdown
                options={categoryOptions}
                value={filterCategory}
                onChange={setFilterCategory}
              />
              <div className="col-span-2 sm:col-span-1">
                <FilterDropdown
                  options={monthOptions}
                  value={filterMonth}
                  onChange={setFilterMonth}
                />
              </div>
            </div>
          </div>

          {/* Transactions List Content */}
          <div className="p-3 md:p-4 min-h-[300px]">
            <h4 className="mb-2 text-sm md:text-base font-semibold text-gray-800">
              {filterType === 'all' && filterCategory === 'all' && filterMonth === 'all'
                ? 'All Transactions' 
                : 'Filter Results'}
            </h4>
            
            <div className="divide-y divide-gray-200">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <HistoryTransactionItem key={tx.id} transaction={tx} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <p className="text-sm md:text-base">
                    {transactions.length === 0 
                      ? 'No transactions yet' 
                      : 'No transactions match your filter'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};