"use client";

import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Import Framer Motion
import CalendarWidget from "@/components/CalendarWidget";
// Import Recharts untuk Grafik
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FiFileText,
  FiCheckSquare,
  FiClock,
  FiChevronDown,
  FiAlertCircle,
  FiCalendar,
  FiX,
} from "react-icons/fi";

const priorityValues = { High: 3, Medium: 2, Low: 1 };

// --- Helper Functions ---
const calculateRemainingTime = (dueDate) => {
  if (!dueDate) return "No date";
  const now = new Date();
  const deadline = new Date(dueDate);
  const diff = deadline.getTime() - now.getTime();
  if (diff <= 0) return "Overdue";
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const seconds = totalSeconds % 60;
  return `${days}d ${hours}h ${seconds}s`;
};

const calculateProgress = (startDate, dueDate) => {
  if (!startDate || !dueDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(dueDate).getTime();
  const now = new Date().getTime();
  if (now >= end) return 0;
  if (now <= start) return 100;
  const totalDuration = end - start;
  if (totalDuration <= 0) return 0;
  const remainingDuration = end - now;
  return Math.min(100, Math.max(0, (remainingDuration / totalDuration) * 100));
};

const getTextColor = (bgColor) => {
  if (!bgColor) return "text-gray-800";
  const darkColors = ["#1F2937", "#111827", "#4B5563"];
  if (darkColors.includes(bgColor)) return "text-white";
  return "text-gray-800";
};

// --------------------------------------------
// SUBCOMPONENTS (DEFINED FIRST TO AVOID ERROR)
// --------------------------------------------

const PriorityTag = memo(({ priority }) => {
  const base = "inline-flex items-center gap-1 px-2 py-[1px] md:py-[2px] rounded-full text-[10px] md:text-xs font-medium w-fit";
  const styles = {
    High: "bg-red-500 text-white",
    Medium: "bg-yellow-500 text-white", 
    Low: "bg-green-500 text-white"
  };
  return (
    <span className={`${base} ${styles[priority]}`}>
      <FiAlertCircle size={11} />
      {priority}
    </span>
  );
});
PriorityTag.displayName = "PriorityTag";

const TaskProgress = memo(({ startDate, dueDate }) => {
  const [remainingTime, setRemainingTime] = useState("");
  const [progress, setProgress] = useState(100);
  useEffect(() => {
    const refresh = () => {
      setRemainingTime(calculateRemainingTime(dueDate));
      setProgress(calculateProgress(startDate, dueDate));
    };
    refresh();
    const timer = setInterval(refresh, 1000);
    return () => clearInterval(timer);
  }, [startDate, dueDate]);
  return (
    <div className="mt-auto">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] text-gray-400 flex items-center gap-1"><FiClock size={10} />Remaining</span>
        <span className="text-[10px] font-semibold text-gray-700 tabular-nums">{remainingTime}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
        <div className="h-1 bg-orange-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
});
TaskProgress.displayName = "TaskProgress";

const ProjectCard = memo(({ title, dueDate, priority, startDate }) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow h-full">
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-semibold text-sm text-gray-800 line-clamp-2 leading-snug" title={title}>{title}</h4>
        <PriorityTag priority={priority} />
      </div>
      <TaskProgress startDate={startDate} dueDate={dueDate} />
    </div>
  );
});
ProjectCard.displayName = "ProjectCard";

const ActivityChart = memo(({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
        <XAxis 
          dataKey="name" 
          tickLine={false} 
          axisLine={false} 
          fontSize={10} 
          tickMargin={8} 
          stroke="#9CA3AF"
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          fontSize={10} 
          tickFormatter={(v) => (v === 0 ? "0" : `${v / 1000}k`)} 
          stroke="#9CA3AF"
        />
        <Tooltip
          cursor={{ fill: '#F3F4F6' }}
          contentStyle={{ fontSize: "12px", borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
          formatter={(value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value)}
        />
        <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={10} />
        <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={10} />
      </BarChart>
    </ResponsiveContainer>
  );
});
ActivityChart.displayName = "ActivityChart";

const SummaryCard = memo(({ summary, mostUrgentTask }) => (
  <section className="bg-white p-4 lg:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4 h-full">
    <div>
      <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3">Task Summary</h3>
      <div className="grid grid-cols-3 gap-2 lg:gap-3">
        <div className="bg-gray-900 text-white p-3 rounded-xl flex flex-col items-center justify-center text-center gap-0.5">
          <FiFileText size={14} className="text-gray-400 mb-1" />
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Total</span>
          <strong className="text-lg leading-none">{summary.total}</strong>
        </div>
        <div className="bg-yellow-500 text-white p-3 rounded-xl flex flex-col items-center justify-center text-center gap-0.5">
          <FiCheckSquare size={14} className="text-white/80 mb-1" />
          <span className="text-[10px] text-white/80 uppercase tracking-wider">Assigned</span>
          <strong className="text-lg leading-none">{summary.assigned}</strong>
        </div>
        <div className="bg-gray-900 text-white p-3 rounded-xl flex flex-col items-center justify-center text-center gap-0.5">
          <FiClock size={14} className="text-gray-400 mb-1" />
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Closed</span>
          <strong className="text-lg leading-none">{summary.closed}</strong>
        </div>
      </div>
    </div>
    <div className="border-t border-gray-100"></div>
    <div className="flex-1 flex flex-col justify-end">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-semibold text-gray-700">
          {mostUrgentTask ? "🔥 Top Priority" : "✨ Status"}
        </p>
        {summary.highPriority > 1 && (
          <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium border border-red-100">
            +{summary.highPriority - 1} others
          </span>
        )}
      </div>
      {mostUrgentTask ? (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 relative overflow-hidden group transition-all hover:border-red-200">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <FiAlertCircle size={40} className="text-red-600" />
          </div>
          <h4 className="text-gray-900 font-bold text-sm line-clamp-1 mb-1.5 relative z-10 pr-8" title={mostUrgentTask.title}>
            {mostUrgentTask.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-red-600 relative z-10">
            <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md shadow-sm border border-red-100 text-[10px]">
              <FiCalendar size={10} />
              {mostUrgentTask.date ? new Date(mostUrgentTask.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
            </span>
            <span className="font-bold text-[10px] uppercase">Segera!</span>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-3 text-green-700">
          <div className="bg-white p-1.5 rounded-full shadow-sm text-green-600 border border-green-100">
            <FiCheckSquare size={16} />
          </div>
          <div>
            <p className="text-xs font-medium opacity-80">All Clear</p>
            <p className="text-xs font-bold">No urgent tasks.</p>
          </div>
        </div>
      )}
    </div>
  </section>
));
SummaryCard.displayName = "SummaryCard";

const RightSidebar = memo(() => {
  const [notes, setNotes] = useState([]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("notes") || "[]");
      const recent = saved.slice(-3).reverse();
      setNotes(recent);
    }
  }, []);

  return (
    <aside className="flex flex-col gap-3 lg:gap-6 min-h-0">
      <div className="hidden lg:block"><CalendarWidget /></div>
      <section className="bg-white p-4 lg:p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-gray-800 text-sm lg:text-base">Notes</h3></div>
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
          <div className="text-gray-400 text-xs py-4 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">Belum ada catatan.</div>
        )}
        <a href="/dashboard/notes" className="text-xs text-blue-600 font-medium mt-4 inline-block hover:underline">View All Notes</a>
      </section>
    </aside>
  );
});
RightSidebar.displayName = "RightSidebar";

// --------------------------------------------
// MAIN CONTENT (LOGIC)
// --------------------------------------------
const MainContent = memo(() => {
  const [recentTasks, setRecentTasks] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [mostUrgentTask, setMostUrgentTask] = useState(null);
  const [summary, setSummary] = useState({
    total: 0, assigned: 0, closed: 0, highPriority: 0,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTasks = JSON.parse(localStorage.getItem("allTasks") || "[]");
      const total = savedTasks.length;
      const assigned = savedTasks.filter((t) => !t.completed).length;
      const closed = savedTasks.filter((t) => t.completed).length;
      const highPriorityTasks = savedTasks.filter((t) => !t.completed && t.priority === "High");
      
      highPriorityTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setSummary({ total, assigned, closed, highPriority: highPriorityTasks.length });
      setMostUrgentTask(highPriorityTasks.length > 0 ? highPriorityTasks[0] : null);

      const pendingTasks = savedTasks.filter((t) => !t.completed);
      pendingTasks.sort((a, b) => priorityValues[b.priority] - priorityValues[a.priority]);
      setRecentTasks(pendingTasks.slice(0, 3));

      const savedTransactions = JSON.parse(localStorage.getItem("transactions") || "[]");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dayFormatter = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" });

      const tempData = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        tempData.push({ name: dayFormatter.format(d), dateObj: d, Income: 0, Expense: 0 });
      }

      const sevenAgo = tempData[0].dateObj;
      savedTransactions.forEach(tx => {
        const txDate = new Date(tx.date); 
        if (txDate >= sevenAgo) {
           const match = tempData.find(c => 
             c.dateObj.getDate() === txDate.getDate() && 
             c.dateObj.getMonth() === txDate.getMonth()
           );
           if (match) {
             if (tx.amount > 0) match.Income += tx.amount;
             else match.Expense += Math.abs(tx.amount);
           }
        }
      });
      setChartData(tempData.map(({ dateObj, ...rest }) => rest));
    }
  }, []);

  return (
    <main className="flex flex-col gap-3 lg:gap-6 min-h-0">
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base lg:text-lg font-semibold text-gray-800">Recent Tasks</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
          {recentTasks.length > 0 ? (
            recentTasks.map((task) => (
              <ProjectCard key={task.id} title={task.title} dueDate={task.date} priority={task.priority} startDate={task.id} />
            ))
          ) : (
            <div className="col-span-full bg-white p-6 rounded-2xl border border-gray-100 text-center text-gray-500 text-sm">
              Tidak ada tugas pending.
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6">
        <section className="bg-white p-4 lg:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base lg:text-lg font-semibold text-gray-800">Activity</h3>
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
              Last 7 Days
            </span>
          </div>
          <div className="h-[200px] md:h-[220px] w-full">
             <ActivityChart data={chartData} />
          </div>
        </section>
        <SummaryCard summary={summary} mostUrgentTask={mostUrgentTask} />
      </div>
    </main>
  );
});
MainContent.displayName = "MainContent";

// --------------------------------------------
// DASHBOARD LAYOUT WRAPPER
// --------------------------------------------
const DashboardLayout = memo(() => {
  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_300px] gap-3 lg:gap-6">
      <MainContent />
      <RightSidebar />
    </div>
  );
});
DashboardLayout.displayName = "DashboardLayout";

// --------------------------------------------
// MAIN EXPORT COMPONENT
// --------------------------------------------
export default function FinanceDashboard() {
  const [isMobileCalendarOpen, setMobileCalendarOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-gray-50 relative">
      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto scroll-smooth min-h-0 hide-scrollbar">
          <div className="p-3 md:p-6 pb-32 min-h-full">
            
            {/* Mobile Header */}
            <div className="flex justify-between items-start mb-4 lg:hidden">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
                <p className="text-xs text-gray-500">Manage and track all your tasks</p>
              </div>
              
              {/* TOMBOL KALENDER (EFEK MORPHING) */}
              <motion.button
                layoutId="dashboard-calendar-trigger"
                onClick={() => setMobileCalendarOpen(true)}
                style={{ opacity: isMobileCalendarOpen ? 0 : 1 }}
                className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-600 hover:bg-gray-50 transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <FiCalendar size={18} />
              </motion.button>
            </div>

            {/* MAIN CONTENT */}
            <DashboardLayout />
            
          </div>
        </div>
      </div>

      {/* MOBILE CALENDAR MODAL */}
      <AnimatePresence>
        {isMobileCalendarOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:hidden">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileCalendarOpen(false)}
            />

            {/* Modal Content */}
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