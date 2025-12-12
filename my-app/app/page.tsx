// File: app/page.tsx

"use client";

import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { FiCalendar, FiX } from "react-icons/fi";
import { Loader2 } from "lucide-react";

// --- IMPORT KOMPONEN KITA ---
// Pastikan file-file ini sudah ada sesuai panduan sebelumnya
import CalendarWidget from "@/components/CalendarWidget";
import { 
  ProjectCard, 
  ActivityChart, 
  SummaryCard,
  getTextColor 
} from "@/components/dashboard/DashboardComponents"; 

// --- IMPORT TYPES ---
import { Task, Transaction, DashboardSummary, ChartData } from "@/components/dashboard/types";

// --- VARIAN ANIMASI ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.05 } 
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "tween", ease: "easeOut", duration: 0.3 }
  }
};

const priorityValues: Record<string, number> = { High: 3, Medium: 2, Low: 1 };

// ============================================================================
// 1. KOMPONEN: RIGHT SIDEBAR (Catatan & Kalender)
// ============================================================================
const RightSidebar = memo(() => {
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("notes") || "[]");
      const recent = saved.slice(-3).reverse();
      setNotes(recent);
    }
  }, []);

  return (
    <motion.aside 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      className="flex flex-col gap-3 lg:gap-6 min-h-0"
    >
      <div className="hidden lg:block"><CalendarWidget /></div>
      
      <section className="bg-white p-4 lg:p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800 text-sm lg:text-base">Notes</h3>
        </div>
        {notes.length > 0 ? (
          <div className="flex flex-col gap-2">
            {notes.map((note) => (
              <a key={note.id} href="/dashboard/notes" title={note.title} 
                className={`p-3 rounded-xl text-xs font-medium truncate cursor-pointer transition-all hover:opacity-80 border ${getTextColor(note.color)}`}
                style={{ backgroundColor: note.color || "#FFFFFF", borderColor: !note.color || note.color === "#FFFFFF" ? "#E5E7EB" : "transparent" }}
              >
                {note.title}
              </a>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-xs py-4 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
            Belum ada catatan.
          </div>
        )}
        <a href="/dashboard/notes" className="text-xs text-blue-600 font-medium mt-4 inline-block hover:underline">View All Notes</a>
      </section>
    </motion.aside>
  );
});
RightSidebar.displayName = "RightSidebar";

// ============================================================================
// 2. KOMPONEN: MAIN CONTENT (Chart & Task)
// ============================================================================
// --- GANTI BAGIAN MainContent DI app/page.tsx DENGAN INI ---

const MainContent = memo(() => {
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [mostUrgentTask, setMostUrgentTask] = useState<Task | null>(null);
  const [summary, setSummary] = useState<DashboardSummary>({
    total: 0, assigned: 0, closed: 0, highPriority: 0,
  });

  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsChartReady(true), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (typeof window === "undefined") return;

      // 1. LOAD TASKS (LocalStorage)
      const savedTasks: Task[] = JSON.parse(localStorage.getItem("allTasks") || "[]");
      // ... (Logic task summary tetap sama) ...
      const total = savedTasks.length;
      const assigned = savedTasks.filter((t) => !t.completed).length;
      const closed = savedTasks.filter((t) => t.completed).length;
      const highPriorityTasks = savedTasks.filter((t) => !t.completed && t.priority === "High");
      highPriorityTasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setSummary({ total, assigned, closed, highPriority: highPriorityTasks.length });
      setMostUrgentTask(highPriorityTasks.length > 0 ? highPriorityTasks[0] : null);
      const pendingTasks = savedTasks.filter((t) => !t.completed);
      pendingTasks.sort((a, b) => (priorityValues[b.priority] || 0) - (priorityValues[a.priority] || 0));
      setRecentTasks(pendingTasks.slice(0, 3));

      // 2. LOAD FINANCE (API Database) - VERSI DEBUG
      try {
        console.log("🚀 [Dashboard] Fetching finance data...");
        const res = await fetch('/api/dashboard/finance');
        
        if (res.ok) {
          const dbTransactions = await res.json();
          console.log("📦 [Dashboard] Data diterima:", dbTransactions);

          // Buat array 7 hari terakhir (Format String YYYY-MM-DD)
          // Ini lebih aman daripada Date Object karena menghindari masalah jam/timezone
          const chartMap: Record<string, { name: string, Income: number, Expense: number }> = {};
          
          const today = new Date();
          const dayFormatter = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }); // "12 Dec"

          // Loop 7 hari ke belakang
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const isoDate = d.toISOString().split('T')[0]; // "2025-12-12"
            chartMap[isoDate] = { 
              name: dayFormatter.format(d), 
              Income: 0, 
              Expense: 0 
            };
          }

          // Masukkan Data Transaksi ke Chart Map
          dbTransactions.forEach((tx: any) => {
             // Ambil tanggal saja "2025-12-12" dari string ISO
             let txDateString = "";
             if (tx.date && tx.date.includes('T')) {
                 txDateString = tx.date.split('T')[0];
             } else {
                 txDateString = tx.date; 
             }

             // Cek apakah tanggal ini ada di 7 hari terakhir dashboard
             if (chartMap[txDateString]) {
               // Cek tipe (Income/Expense) menggunakan field 'type' atau 'amount'
               // Kita handle dua-duanya biar aman
               if (tx.type === 'income' || tx.amount > 0) {
                   chartMap[txDateString].Income += Math.abs(tx.amount);
               } else {
                   chartMap[txDateString].Expense += Math.abs(tx.amount);
               }
             }
          });

          // Convert Map ke Array untuk Recharts
          const finalData = Object.values(chartMap);
          console.log("📊 [Dashboard] Data Chart Final:", finalData);
          setChartData(finalData);
        } else {
            console.error("❌ [Dashboard] Gagal fetch, status:", res.status);
        }
      } catch (error) {
        console.error("❌ [Dashboard] Error loading finance:", error);
      }
    };
    loadData();
  }, []);

  return (
    <motion.main 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-3 lg:gap-6 min-h-0"
    >
      <motion.section variants={itemVariants}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base lg:text-lg font-semibold text-gray-800">Recent Tasks</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
          {recentTasks.length > 0 ? (
            recentTasks.map((task) => (
              <ProjectCard 
                key={task.id} 
                title={task.title} 
                dueDate={task.date} 
                priority={task.priority} 
                startDate={String(task.id)} 
              />
            ))
          ) : (
            <div className="col-span-full bg-white p-6 rounded-2xl border border-gray-100 text-center text-gray-500 text-sm">
              Tidak ada tugas pending.
            </div>
          )}
        </div>
      </motion.section>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6">
        <section className="bg-white p-4 lg:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base lg:text-lg font-semibold text-gray-800">Activity</h3>
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">Last 7 Days</span>
          </div>
          <div className="h-[200px] md:h-[220px] w-full">
             {isChartReady ? (
                <ActivityChart data={chartData} />
             ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
                   <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
                </div>
             )}
          </div>
        </section>
        <SummaryCard summary={summary} mostUrgentTask={mostUrgentTask} />
      </motion.div>
    </motion.main>
  );
});

MainContent.displayName = "MainContent";

// ============================================================================
// 3. LAYOUT WRAPPER (Gabungkan Main & Sidebar)
// ============================================================================
const DashboardLayout = memo(() => {
  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_300px] gap-3 lg:gap-6">
      <MainContent />
      <RightSidebar />
    </div>
  );
});
DashboardLayout.displayName = "DashboardLayout";

// ============================================================================
// 4. HALAMAN UTAMA (HOME)
// ============================================================================
export default function Home() {
  const [isMobileCalendarOpen, setMobileCalendarOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-gray-50 relative font-sans">
      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto scroll-smooth min-h-0 hide-scrollbar">
          <div className="p-3 md:p-6 pb-32 min-h-full">
            
            {/* Header Mobile */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-between items-start mb-4 lg:hidden"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
                <p className="text-xs text-gray-500">Manage and track all your tasks</p>
              </div>
              
              <motion.button
                layoutId="dashboard-calendar-trigger"
                onClick={() => setMobileCalendarOpen(true)}
                style={{ opacity: isMobileCalendarOpen ? 0 : 1 }}
                className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-600 hover:bg-gray-50 transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <FiCalendar size={18} />
              </motion.button>
            </motion.div>

            {/* Layout Utama */}
            <DashboardLayout />
            
          </div>
        </div>
      </div>

      {/* MODAL KALENDER MOBILE */}
      <AnimatePresence>
        {isMobileCalendarOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileCalendarOpen(false)}
            />

            <motion.div 
              layoutId="dashboard-calendar-trigger" 
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative z-10"
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
            >
              <div className="flex justify-between items-center p-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Calendar</h3>
                <button 
                  onClick={() => setMobileCalendarOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="p-3">
                <CalendarWidget />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}