"use client";

import React, { useState } from 'react';
import DashboardContent from '@/components/dashboard/finance/Dashboard';
import AddTransactionPage from '@/components/dashboard/finance/AddTransaction';
import TransactionHistoryPage from '@/components/dashboard/finance/TransactionHistory';

const initialTransactionsData = [];

export default function FinancePage() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [transactions, setTransactions] = useState(initialTransactionsData);

  const handleSaveTransaction = (newTransaction) => {
    setTransactions([newTransaction, ...transactions]);
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardContent
            onAddTransaction={() => setCurrentPage('addTransaction')}
            onShowHistory={() => setCurrentPage('history')}
            transactions={transactions}
          />
        );
      case 'addTransaction':
        return (
          <AddTransactionPage
            onBack={() => setCurrentPage('dashboard')}
            onSaveTransaction={handleSaveTransaction}
          />
        );
      case 'history':
        return (
          <TransactionHistoryPage
            onBack={() => setCurrentPage('dashboard')}
            transactions={transactions}
          />
        );
      default:
        return <div>Halaman tidak ditemukan</div>;
    }
  };

  return (
    // Tidak perlu h-screen atau overflow di sini
    <div className="flex-1 bg-gray-50 font-sans">
      {renderPage()}
    </div>
  );
}
