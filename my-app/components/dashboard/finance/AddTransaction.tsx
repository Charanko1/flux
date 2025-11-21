"use client";

import React, { useState } from 'react';
import { ArrowLeft, Plus, ArrowDownCircle } from 'lucide-react';

// ==================================================================
// SECTION 2: ADD TRANSACTION COMPONENT (Responsive & English)
// ==================================================================
export default function AddTransactionPage({ onBack, onSaveTransaction }) {
  const [type, setType] = useState('income');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dateObj = new Date(date + 'T00:00:00');
    // Format date specifically for ID locale display but keep standard logic
    const formattedDate = dateObj.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const sanitizedAmount = amount.replace(/\./g, '');
    const numericAmount = parseFloat(sanitizedAmount);
    const finalAmount = type === 'expense' ? -Math.abs(numericAmount) : Math.abs(numericAmount);

    const newTransaction = {
      id: Date.now(),
      type,
      title: description || (type === 'income' ? 'New Income' : 'New Expense'),
      category: category || 'Others',
      amount: finalAmount,
      date: formattedDate
    };

    onSaveTransaction(newTransaction);
  };

  return (
    // CONTAINER UTAMA:
    // Mobile: p-4
    // Desktop: p-8, max-w-2xl (biar form tidak terlalu lebar di layar besar)
    <main className="p-4 md:p-8 max-w-2xl mx-auto w-full font-inter">
      
      {/* TOMBOL KEMBALI */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 md:mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
        Back
      </button>

      {/* CARD FORM */}
      {/* Mobile: p-5 (lebih rapat) | Desktop: p-8 */}
      <div className="bg-white p-5 md:p-8 rounded-xl shadow-sm border border-gray-200">
        
        {/* HEADER TITLE */}
        {/* Mobile: text-xl | Desktop: text-2xl */}
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-5 md:mb-6">Add New Transaction</h2>
        
        <form onSubmit={handleSubmit}>
          
          {/* 1. TYPE SELECTOR (INCOME / EXPENSE) */}
          <div className="mb-5 md:mb-6">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {/* Button Income */}
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                // Mobile: p-3 | Desktop: p-6
                className={`flex flex-col items-center justify-center p-3 md:p-6 rounded-lg border-2 transition-all ${type === 'income' ? 'border-yellow-500 bg-yellow-50/50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
              >
                <div className={`p-1.5 md:p-2 rounded-full ${type === 'income' ? 'bg-yellow-100' : 'bg-gray-100'} mb-1.5 md:mb-2`}>
                  {/* Mobile: h-5 w-5 | Desktop: h-6 w-6 */}
                  <Plus className={`h-5 w-5 md:h-6 md:w-6 ${type === 'income' ? 'text-yellow-600' : 'text-gray-400'}`} />
                </div>
                {/* Mobile: text-sm | Desktop: text-base */}
                <span className={`text-sm md:text-base font-semibold ${type === 'income' ? 'text-gray-900' : 'text-gray-500'}`}>Income</span>
              </button>

              {/* Button Expense */}
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex flex-col items-center justify-center p-3 md:p-6 rounded-lg border-2 transition-all ${type === 'expense' ? 'border-red-500 bg-red-50/50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
              >
                <div className={`p-1.5 md:p-2 rounded-full ${type === 'expense' ? 'bg-red-100' : 'bg-gray-100'} mb-1.5 md:mb-2`}>
                  <ArrowDownCircle className={`h-5 w-5 md:h-6 md:w-6 ${type === 'expense' ? 'text-red-600' : 'text-gray-400'}`} />
                </div>
                <span className={`text-sm md:text-base font-semibold ${type === 'expense' ? 'text-gray-900' : 'text-gray-500'}`}>Expense</span>
              </button>
            </div>
          </div>

          {/* 2. CATEGORY SELECT */}
          <div className="mb-3 md:mb-4">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Category</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                // Mobile: p-2.5 text-sm | Desktop: p-3 text-base
                className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-lg p-2.5 md:p-3 text-sm md:text-base text-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
              >
                <option value="" disabled>Select category</option>
                {type === 'income' ? (
                  <>
                    <option value="Salary">Salary</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Investment">Investment</option>
                    <option value="Gift">Gift</option>
                    <option value="Others">Other Income</option>
                  </>
                ) : (
                  <>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Bills">Bills</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Health">Health</option>
                    <option value="Others">Other Expense</option>
                  </>
                )}
              </select>
              {/* Custom Arrow for Select */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
              </div>
            </div>
          </div>

          {/* 3. AMOUNT INPUT */}
          <div className="mb-3 md:mb-4">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Amount (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[\d.]*$/.test(value)) {
                  setAmount(value);
                }
              }}
              required
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 md:p-3 text-sm md:text-base text-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
              placeholder="e.g. 50000"
            />
          </div>

          {/* 4. DESCRIPTION INPUT */}
          <div className="mb-3 md:mb-4">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Description</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 md:p-3 text-sm md:text-base text-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none resize-none"
              placeholder="Add notes..."
            ></textarea>
          </div>

          {/* 5. DATE INPUT */}
          <div className="mb-5 md:mb-6">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 md:p-3 text-sm md:text-base text-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            // Mobile: py-2.5 text-sm | Desktop: py-3 text-base
            className="w-full bg-yellow-500 text-white rounded-lg px-4 py-2.5 md:py-3 text-sm md:text-base font-medium hover:bg-yellow-600 active:bg-yellow-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4 md:h-5 md:w-5" />
            Save Transaction
          </button>
          
        </form>
      </div>
    </main>
  );
};