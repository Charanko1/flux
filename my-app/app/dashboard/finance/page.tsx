"use client";

import React, { useState, useEffect } from "react";
import DashboardContent from "@/components/dashboard/finance/Dashboard";
import AddTransactionPage from "@/components/dashboard/finance/AddTransaction";
import TransactionHistoryPage from "@/components/dashboard/finance/TransactionHistory";

export interface Transaction {
  id: string | number;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
}

export default function FinancePage() {
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "addTransaction" | "history"
  >("dashboard");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // GET data saat halaman dibuka
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/dashboard/finance");
        if (response.ok) {
          const data = await response.json();
          const formattedData: Transaction[] = data.map((item: any) => {
            const rawType = (item.type || "").toString().toLowerCase();
            const normalizedType =
              rawType === "expense" ? "expense" : "income";

            return {
              ...item,
              id: item._id,
              amount: Math.abs(item.amount ?? 0),
              date: new Date(item.date).toISOString().split("T")[0],
              type: normalizedType,
            };
          });
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

  // POST / simpan data baru
  const handleSaveTransaction = async (newTransaction: Transaction) => {
    const tempId = Math.random().toString();
    const optimisticData: Transaction = { ...newTransaction, id: tempId };

    setTransactions((prev) => [optimisticData, ...prev]);
    setCurrentPage("dashboard");

    try {
      const response = await fetch("/api/dashboard/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        const rawType = (savedData.type || "").toString().toLowerCase();
        const normalizedType =
          rawType === "expense" ? "expense" : "income";

        setTransactions((prev) =>
          prev.map((t) =>
            t.id === tempId
              ? {
                  ...t,
                  ...savedData,
                  id: savedData._id,
                  amount: Math.abs(savedData.amount ?? 0),
                  date: new Date(savedData.date).toISOString().split("T")[0],
                  type: normalizedType,
                }
              : t
          )
        );
      } else {
        console.error("Gagal menyimpan ke server");
        setTransactions((prev) => prev.filter((t) => t.id !== tempId));
      }
    } catch (error) {
      console.error("Error jaringan:", error);
      setTransactions((prev) => prev.filter((t) => t.id !== tempId));
    }
  };

  const renderPage = () => {
    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <p className="text-gray-500">Loading financial data...</p>
        </div>
      );
    }

    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardContent
            onAddTransaction={() => setCurrentPage("addTransaction")}
            onShowHistory={() => setCurrentPage("history")}
            transactions={transactions}
          />
        );
      case "addTransaction":
        return (
          <AddTransactionPage
            onBack={() => setCurrentPage("dashboard")}
            onSaveTransaction={handleSaveTransaction as any}
          />
        );
      case "history":
        return (
          <TransactionHistoryPage
            onBack={() => setCurrentPage("dashboard")}
            transactions={transactions}
          />
        );
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="flex-1 bg-gray-50 font-sans min-h-screen">
      {renderPage()}
    </div>
  );
}
