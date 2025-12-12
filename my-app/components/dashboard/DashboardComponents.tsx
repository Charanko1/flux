import React, { memo, useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  FiFileText, FiCheckSquare, FiClock, FiAlertCircle, FiCalendar 
} from "react-icons/fi";
import { Task, DashboardSummary } from "./types";

// --- HELPER FUNCTIONS ---

export const calculateRemainingTime = (dueDate: string | Date) => {
  if (!dueDate) return "-";
  const now = new Date();
  const deadline = new Date(dueDate);
  const diff = deadline.getTime() - now.getTime();

  // Kalau waktu habis
  if (diff <= 0) return "Time's up!";

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60; // <--- INI DETIKNYA
  
  // Logic Tampilan:
  // Kalau masih ada Hari: "2d 5h 30m 10s"
  // Kalau sisa jam/menit: "5h 30m 10s"
  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  return `${hours}h ${minutes}m ${seconds}s`;
};

// Logic Mundur: 100% (Full/Aman) -> 0% (Habis/Merah)
export const calculateProgress = (startDate?: string, dueDate?: string) => {
  if (!startDate || !dueDate) return 0;
  
  const start = new Date(startDate).getTime();
  const end = new Date(dueDate).getTime();
  const now = new Date().getTime();

  if (now <= start) return 100;
  if (now >= end) return 0;

  const totalDuration = end - start;
  const remainingTime = end - now;

  return Math.min(100, Math.max(0, (remainingTime / totalDuration) * 100));
};

export const getTextColor = (bgColor?: string) => {
  if (!bgColor) return "text-gray-800";
  const darkColors = ["#1F2937", "#111827", "#4B5563"];
  if (darkColors.includes(bgColor)) return "text-white";
  return "text-gray-800";
};

// --- COMPONENTS ---

interface PriorityTagProps {
  priority: string;
}
export const PriorityTag = memo(({ priority }: PriorityTagProps) => {
  const base = "inline-flex items-center gap-1 px-2 py-[1px] md:py-[2px] rounded-full text-[10px] md:text-xs font-medium w-fit";
  const styles:Record<string, string> = {
    High: "bg-red-500 text-white",
    Medium: "bg-yellow-500 text-white", 
    Low: "bg-green-500 text-white"
  };
  return (
    <span className={`${base} ${styles[priority] || "bg-gray-200 text-gray-800"}`}>
      <FiAlertCircle size={11} />
      {priority}
    </span>
  );
});
PriorityTag.displayName = "PriorityTag";

interface TaskProgressProps {
  startDate?: string;
  dueDate: string;
}
export const TaskProgress = memo(({ startDate, dueDate }: TaskProgressProps) => {
  const [remainingTime, setRemainingTime] = useState("");
  const [progress, setProgress] = useState(100);
  
  useEffect(() => {
    const refresh = () => {
      setRemainingTime(calculateRemainingTime(dueDate));
      setProgress(calculateProgress(startDate, dueDate));
    };
    refresh();
    const timer = setInterval(refresh, 1000); // Update Tiap 1 Detik
    return () => clearInterval(timer);
  }, [startDate, dueDate]);

  // Warna Bar: Hijau (Aman) -> Kuning (Waspada) -> Merah (Kritis)
  let barColor = "bg-red-500"; 
  if (progress > 20) barColor = "bg-yellow-500";
  if (progress > 50) barColor = "bg-green-500";

  return (
    <div className="mt-auto">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <FiClock size={10} /> Remaining
        </span>
        <span className="text-[10px] font-semibold text-gray-700 tabular-nums">
            {remainingTime}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div 
            className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
            style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
});
TaskProgress.displayName = "TaskProgress";

interface ProjectCardProps {
  title: string;
  dueDate: string;
  priority: any;
  startDate?: string;
}
export const ProjectCard = memo(({ title, dueDate, priority, startDate }: ProjectCardProps) => {
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

interface ActivityChartProps {
  data: any[];
}
export const ActivityChart = memo(({ data }: ActivityChartProps) => {
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
          formatter={(value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value)}
        />
        <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={10} />
        <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={10} />
      </BarChart>
    </ResponsiveContainer>
  );
});
ActivityChart.displayName = "ActivityChart";

interface SummaryCardProps {
  summary: DashboardSummary;
  mostUrgentTask: Task | null;
}
export const SummaryCard = memo(({ summary, mostUrgentTask }: SummaryCardProps) => (
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