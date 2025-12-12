// File: app/page.tsx

"use client";

import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { FiCalendar, FiX } from "react-icons/fi";
import { Loader2 } from "lucide-react";

// --- IMPORT KOMPONEN ---
import CalendarWidget from "@/components/CalendarWidget";
import { 
  ProjectCard, 
  ActivityChart, 
  SummaryCard,
  getTextColor 
} from "@/components/dashboard/DashboardComponents"; 

// --- IMPORT TYPES ---
import { Task, DashboardSummary, ChartData } from "@/components/dashboard/types";

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

// Logic Score untuk Sorting (High > Medium > Low)
const priorityValues: Record<string, number> = { High: 3, Medium: 2, Low: 1 };

// ============================================================================
// 1. KOMPONEN: RIGHT SIDEBAR (Catatan Database & Kalender)
// ============================================================================
const RightSidebar = memo(() => {
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentNotes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dashboard/notes', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setNotes(data.slice(0, 3));
        }
      } catch (error) {
        console.error("Gagal mengambil notes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentNotes();
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
          <h3 className="font-semibold text-gray-800 text-sm lg:text-base">Recent Notes</h3>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        ) : notes.length > 0 ? (
          <div className="flex flex-col gap-2">
            {notes.map((note) => (
              <a 
                key={note._id || note.id} 
                href="/dashboard/notes" 
                title={note.title} 
                className={`p-3 rounded-xl text-xs font-medium truncate cursor-pointer transition-all hover:opacity-80 border ${getTextColor(note.color)}`}
                style={{ 
                  backgroundColor: note.color || "#FFFFFF", 
                  borderColor: !note.color || note.color === "#FFFFFF" ? "#E5E7EB" : "transparent" 
                }}
              >
                {note.title}
              </a>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-xs py-4 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
            No notes available.
          </div>
        )}
        
        <a href="/dashboard/notes" className="text-xs text-blue-600 font-medium mt-4 inline-block hover:underline">View All Notes</a>
      </section>
    </motion.aside>
  );
});
RightSidebar.displayName = "RightSidebar";

// ============================================================================
// 2. KOMPONEN: MAIN CONTENT (Chart & Task Database)
// ============================================================================
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
      // ---------------------------------------------------------
      // 1. FETCH TASKS (Backend sudah Auto-Update Priority)
      // ---------------------------------------------------------
      try {
        const resTask = await fetch('/api/dashboard/task', { cache: 'no-store' });
        if (resTask.ok) {
          const dbTasks = await resTask.json();
          const allTasks: Task[] = dbTasks.map((t: any) => ({ ...t, id: t._id }));

          // Hitung Statistik
          const total = allTasks.length;
          const assigned = allTasks.filter((t) => !t.completed).length;
          const closed = allTasks.filter((t) => t.completed).length;
          
          const highPriorityTasks = allTasks.filter((t) => !t.completed && t.priority === "High");
          // Urutkan High Priority berdasarkan tanggal terdekat
          highPriorityTasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          setSummary({ total, assigned, closed, highPriority: highPriorityTasks.length });
          setMostUrgentTask(highPriorityTasks.length > 0 ? highPriorityTasks[0] : null);

          // Sorting List Utama: Prioritas dulu (High > Medium > Low), baru Tanggal
          const pendingTasks = allTasks.filter((t) => !t.completed);
          pendingTasks.sort((a, b) => {
             // 1. Bandingkan Priority (High=3, Medium=2, Low=1)
             const pDiff = (priorityValues[b.priority] || 0) - (priorityValues[a.priority] || 0);
             if (pDiff !== 0) return pDiff;
             
             // 2. Kalau priority sama, yang deadline-nya lebih dekat di atas
             return new Date(a.date).getTime() - new Date(b.date).getTime();
          });
          setRecentTasks(pendingTasks.slice(0, 3));
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
      }

      // ---------------------------------------------------------
      // 2. FETCH FINANCE (Logic tetap sama)
      // ---------------------------------------------------------
      try {
        const resFinance = await fetch('/api/dashboard/finance', { cache: 'no-store' });
        if (resFinance.ok) {
          const dbTransactions = await resFinance.json();
          
          const today = new Date();
          const dayFormatter = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" });
          
          const toLocalISOString = (d: Date) => {
            const offset = d.getTimezoneOffset() * 60000;
            return new Date(d.getTime() - offset).toISOString().split('T')[0];
          };

          const chartMap: Record<string, { name: string, Income: number, Expense: number }> = {};
          
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateKey = toLocalISOString(d);
            chartMap[dateKey] = { 
              name: dayFormatter.format(d), 
              Income: 0, 
              Expense: 0 
            };
          }

          dbTransactions.forEach((tx: any) => {
             if (!tx.date) return;
             const rawDateStr = tx.date.toString();
             const txDateKey = rawDateStr.includes('T') ? rawDateStr.split('T')[0] : rawDateStr;

             if (chartMap[txDateKey]) {
               const amount = Number(tx.amount);
               if (tx.type === 'income' || amount > 0) {
                   chartMap[txDateKey].Income += Math.abs(amount);
               } else {
                   chartMap[txDateKey].Expense += Math.abs(amount);
               }
             }
          });
          
          setChartData(Object.values(chartMap));
        }
      } catch (error) {
        console.error("Error loading finance:", error);
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
                priority={task.priority} // Priority sudah otomatis benar dari DB
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
// 3. LAYOUT WRAPPER
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