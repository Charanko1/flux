"use client";

import React, { useState, useEffect } from 'react';
import DashboardContent from '@/components/dashboard/finance/Dashboard';
import AddTransactionPage from '@/components/dashboard/finance/AddTransaction';
import TransactionHistoryPage from '@/components/dashboard/finance/TransactionHistory';

export interface Transaction {
  id: string | number;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

export default function FinancePage() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. FETCH DATA (GET) SAAT HALAMAN DIBUKA
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/dashboard/finance');
        if (response.ok) {
          const data = await response.json();
          // Mapping _id dari MongoDB ke id untuk Frontend
          const formattedData = data.map((item: any) => ({
            ...item,
            id: item._id, 
            date: new Date(item.date).toISOString().split('T')[0]
          }));
          setTransactions(formattedData);
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // 2. FUNGSI SIMPAN DATA (POST)
  const handleSaveTransaction = async (newTransaction: Transaction) => {
    // A. Optimistic Update (Tampilkan dulu di UI biar cepat)
    const tempId = Math.random().toString();
    const optimisticData = { ...newTransaction, id: tempId };
    
    // Tambah ke state local dulu
    setTransactions((prev) => [optimisticData, ...prev]);
    setCurrentPage('dashboard');

    try {
      // B. Kirim ke Backend API
      const response = await fetch('/api/dashboard/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTransaction.title,
          amount: newTransaction.amount,
          category: newTransaction.category,
          date: newTransaction.date,
          type: newTransaction.type,
        }),
      });

      if (response.ok) {
        const savedData = await response.json();
        // C. Update ID sementara (tempId) jadi ID asli database (_id)
        setTransactions((prev) => 
          prev.map((t) => (t.id === tempId ? { ...savedData, id: savedData._id } : t))
        );
      } else {
        // Jika server error, hapus data dari UI
        console.error("Gagal menyimpan ke server");
        setTransactions((prev) => prev.filter((t) => t.id !== tempId));
      }
    } catch (error) {
      // Jika koneksi error, hapus data dari UI
      console.error("Error jaringan:", error);
      setTransactions((prev) => prev.filter((t) => t.id !== tempId));
    }
  };

  const renderPage = () => {
    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <p className="text-gray-500">Memuat data keuangan...</p>
        </div>
      );
    }

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
    <div className="flex-1 bg-gray-50 font-sans min-h-screen">
      {renderPage()}
    </div>
  );
}