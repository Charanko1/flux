"use client";

import React, { useState, useEffect, memo } from "react";
import CalendarWidget from "@/components/CalendarWidget";
import {
  FiFileText,
  FiCheckSquare,
  FiClock,
  FiChevronDown,
  FiAlertCircle,
  FiCalendar, // Tambah icon calendar
  FiX, // Tambah icon close
} from "react-icons/fi";

const priorityValues = { High: 3, Medium: 2, Low: 1 };

// --- Helper Functions (Tetap sama) ---
const calculateRemainingTime = (dueDate: string) => {
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

const calculateProgress = (startDate: string, dueDate: string) => {
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

const getTextColor = (bgColor: string) => {
  if (!bgColor) return "text-gray-800";
  const darkColors = ["#1F2937", "#111827", "#4B5563"];
  if (darkColors.includes(bgColor)) return "text-white";
  return "text-gray-800";
};

// --------------------------------------------
// MAIN COMPONENT
// --------------------------------------------
export default function FinanceDashboard() {
  // State untuk Mobile Calendar Popup
  const [isMobileCalendarOpen, setMobileCalendarOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-gray-100 relative">
      {/* SCROLLABLE CONTAINER */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto scroll-smooth min-h-0 hide-scrollbar">
          <div className="p-4 sm:p-6 pb-32 min-h-full">
            
            {/* === MOBILE HEADER (Sesuai Gambar) === */}
            {/* Hanya muncul di layar kecil (lg:hidden) */}
            <div className="flex justify-between items-start mb-6 lg:hidden">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <p className="text-sm text-gray-500">
                  Manage and track all your tasks
                </p>
              </div>
              
              {/* Tombol Kalender Mobile */}
              <button
                onClick={() => setMobileCalendarOpen(true)}
                className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <FiCalendar size={20} />
              </button>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_300px] gap-4 sm:gap-5 lg:gap-6">
              <MainContent />
              {/* Kirim props mobile hidden ke sidebar */}
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>

      {/* === MOBILE CALENDAR MODAL === */}
      {isMobileCalendarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 lg:hidden backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Calendar</h3>
              <button 
                onClick={() => setMobileCalendarOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>
            
            {/* Calendar Widget */}
            <div className="p-4">
              <CalendarWidget />
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

// --------------------------------------------
// MAIN CONTENT
// --------------------------------------------
const MainContent = () => {
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    assigned: 0,
    closed: 0,
    highPriority: 0,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTasks = JSON.parse(localStorage.getItem("allTasks") || "[]");
      const total = savedTasks.length;
      const assigned = savedTasks.filter((t: any) => !t.completed).length;
      const closed = savedTasks.filter((t: any) => t.completed).length;
      const highPriority = savedTasks.filter(
        (t: any) => !t.completed && t.priority === "High"
      ).length;
      setSummary({ total, assigned, closed, highPriority });

      const pendingTasks = savedTasks.filter((t: any) => !t.completed);
      pendingTasks.sort(
        (a: any, b: any) => priorityValues[b.priority] - priorityValues[a.priority]
      );
      setRecentTasks(pendingTasks.slice(0, 3));
    }
  }, []);

  return (
    <main className="flex flex-col gap-6 min-h-0">
      {/* RECENT TASKS */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Recent Tasks</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {recentTasks.length > 0 ? (
            recentTasks.map((task) => (
              <ProjectCard
                key={task.id}
                title={task.title}
                dueDate={task.date}
                priority={task.priority}
                startDate={task.id}
              />
            ))
          ) : (
            <div className="col-span-full bg-white p-6 rounded-2xl shadow-sm text-center text-gray-500">
              Tidak ada tugas pending.
            </div>
          )}
        </div>
      </section>

      {/* ACTIVITY + SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white p-4 md:p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Activity</h3>
            <span className="text-sm text-gray-500 flex items-center gap-1 cursor-pointer">
              Weekly <FiChevronDown />
            </span>
          </div>
          <div className="h-[220px] md:h-[250px] flex items-center justify-center bg-gray-100 rounded-lg text-gray-400 text-sm">
            [Chart Placeholder]
          </div>
        </section>

        <SummaryCard summary={summary} />
      </div>
    </main>
  );
};

// --------------------------------------------
// SUBCOMPONENTS
// --------------------------------------------
const SummaryCard = memo(({ summary }) => (
  <section className="bg-white p-4 md:p-6 rounded-2xl shadow-sm flex flex-col gap-4">
    <h3 className="text-lg font-semibold text-gray-900">Task Summary</h3>
    <div className="grid grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
      <div className="bg-gray-800 text-white p-3 md:p-4 rounded-2xl flex flex-col items-center gap-1">
        <FiFileText size={18} />
        <span>Task</span>
        <strong className="text-xl md:text-2xl">{summary.total}</strong>
      </div>
      <div className="bg-yellow-500 text-white p-3 md:p-4 rounded-2xl flex flex-col items-center gap-1">
        <FiCheckSquare size={18} />
        <span>Assigned</span>
        <strong className="text-xl md:text-2xl">{summary.assigned}</strong>
      </div>
      <div className="bg-gray-800 text-white p-3 md:p-4 rounded-2xl flex flex-col items-center gap-1">
        <FiClock size={18} />
        <span>Closed</span>
        <strong className="text-xl md:text-2xl">{summary.closed}</strong>
      </div>
    </div>
    <div className="mt-1">
      <p className="text-xs sm:text-sm text-gray-600">High Priority Tasks</p>
      <strong className="text-2xl sm:text-3xl">{summary.highPriority}</strong>
    </div>
  </section>
));
SummaryCard.displayName = "SummaryCard";

const PriorityTag = memo(({ priority }) => {
  const base =
    "inline-flex items-center gap-1 px-2 py-[1px] md:py-[2px] rounded-full text-[10px] md:text-xs font-medium w-fit";
  const styles = {
    High: "bg-red-500 text-white",
    Medium: "bg-yellow-400 text-black",
    Low: "bg-green-500 text-white",
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
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
          <FiClock size={14} />
          Remaining
        </span>
        <span className="text-xs md:text-sm font-semibold text-gray-700 tabular-nums">
          {remainingTime}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 bg-orange-400 transition-all duration-500 ease-linear will-change-transform"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
});
TaskProgress.displayName = "TaskProgress";

const ProjectCard = memo(({ title, dueDate, priority, startDate }) => {
  return (
    <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm flex flex-col gap-4 transform transition-transform hover:scale-[1.01]">
      <h4
        className="font-semibold text-base text-gray-800 line-clamp-1"
        title={title}
      >
        {title}
      </h4>
      <TaskProgress startDate={startDate} dueDate={dueDate} />
      <PriorityTag priority={priority} />
    </div>
  );
});
ProjectCard.displayName = "ProjectCard";

// --------------------------------------------
// RIGHT SIDEBAR (UPDATED)
// --------------------------------------------
const RightSidebar = () => {
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("notes") || "[]");
      const recent = saved.slice(-3).reverse();
      setNotes(recent);
    }
  }, []);

  return (
    <aside className="flex flex-col gap-6 min-h-0">
      
      {/* CALENDAR WIDGET - HANYA MUNCUL DI DESKTOP (hidden lg:block) */}
      {/* Di Mobile disembunyikan karena sudah pindah ke tombol header */}
      <div className="hidden lg:block">
        <CalendarWidget />
      </div>

      <section className="bg-white p-5 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">Notes</h3>
        </div>

        {notes.length > 0 ? (
          <div className="flex flex-col gap-3">
            {notes.map((note) => (
              <a
                key={note.id}
                href="/dashboard/notes"
                title={note.title}
                className={`p-3 rounded-lg text-sm font-medium truncate cursor-pointer transition-opacity hover:opacity-80 border ${getTextColor(
                  note.color
                )}`}
                style={{
                  backgroundColor: note.color || "#FFFFFF",
                  borderColor:
                    !note.color ||
                    note.color === "#FFFFFF" ||
                    note.color === "#F5F5F5"
                      ? "#E0E0E0"
                      : "transparent",
                }}
              >
                {note.title}
              </a>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm py-4 text-center">
            Belum ada catatan.
          </div>
        )}

        <a
          href="/dashboard/notes"
          className="text-sm text-blue-500 font-medium mt-4 inline-block"
        >
          View All Notes
        </a>
      </section>
    </aside>
  );
};