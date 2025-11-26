"use client";

import React, { useState } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Filter
} from 'lucide-react';

// Import Types, Helpers, Components
import { TransactionHistoryPageProps } from './types'; // Sesuaikan path
import { 
  parseDateIDN, 
  formatCurrencyHistory, 
  getMonthYear 
} from './TransactionHelpers'; // Sesuaikan path
import { 
  HistoryStatsCard, 
  HistoryTransactionItem, 
  FilterDropdown 
} from './TransactionComponents'; // Sesuaikan path

export default function TransactionHistoryPage({ onBack, transactions }: TransactionHistoryPageProps) {

  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');

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
  const uniqueCategories = Array.from(new Set(transactions.map(tx => tx.category))).sort();
  const categoryOptions = [
    { value: 'all', label: 'All Category' },
    ...uniqueCategories.map(cat => ({ value: cat, label: cat }))
  ];

  // 3. Options: Month
  const sortedTxForMonths = [...transactions].sort((a, b) => {
    const dateA = parseDateIDN(a.date);
    const dateB = parseDateIDN(b.date);
    const timeA = dateA ? dateA.getTime() : 0;
    const timeB = dateB ? dateB.getTime() : 0;
    return timeB - timeA;
  });
  
  const uniqueMonths = Array.from(new Set(
    sortedTxForMonths
      .map(tx => getMonthYear(tx.date))
      .filter(m => m !== '') 
  ));
  
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
}