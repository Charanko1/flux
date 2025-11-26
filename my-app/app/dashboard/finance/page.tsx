"use client";

import React, { useState, useEffect } from 'react';
import DashboardContent from '@/components/dashboard/finance/Dashboard';
import AddTransactionPage from '@/components/dashboard/finance/AddTransaction';
import TransactionHistoryPage from '@/components/dashboard/finance/TransactionHistory';

// 1. PERBAIKAN DI SINI: Hapus tanda tanya (?) pada 'type'
export interface Transaction {
  id: string | number;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense'; // Hapus '?' agar wajib diisi, sesuai permintaan DashboardContent
}

const initialTransactionsData: Transaction[] = [];

export default function FinancePage() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("transactions");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error("Gagal parsing data transaksi:", error);
        }
      }
    }
    return initialTransactionsData;
  });

  const handleSaveTransaction = (newTransaction: Transaction) => {
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    if (typeof window !== 'undefined') {
      localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
    }
    setCurrentPage('dashboard');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("transactions", JSON.stringify(transactions));
    }
  }, [transactions]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardContent
            onAddTransaction={() => setCurrentPage('addTransaction')}
            onShowHistory={() => setCurrentPage('history')}
            // Sekarang error ini harusnya hilang karena tipe datanya sudah cocok (sama-sama wajib)
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
    <div className="flex-1 bg-gray-50 font-sans">
      {renderPage()}
    </div>
  );
}