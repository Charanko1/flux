"use client";
import React, { useState, useMemo, useEffect } from "react";
import { FiFilter, FiPlus } from "react-icons/fi";
import { AnimatePresence } from "framer-motion";

// Components Imports
// IMPORT PENTING: Ambil juga TaskData dari modal
import TaskModal, { TaskData } from '@/components/dashboard/task/TaskModal';
import StatCard from '@/components/dashboard/task/StatCard';
import TaskItem from '@/components/dashboard/task/TaskItem';
import FilterButton from '@/components/dashboard/task/FilterButton';
import TaskHeader from '@/components/dashboard/task/TaskHeader';

// --- 1. DEFINISI TIPE DATA (INTERFACE) ---
// Sesuaikan dengan TaskData tapi id wajib ada di sini
export interface Task {
  id: number | string;
  title: string;
  priority: string;
  completed: boolean;
  date: string;
  category: string;
  description?: string; // Tambahkan ini biar sinkron
}

// --- HELPER OBJECT ---
const priorityValues: Record<string, number> = {
  High: 3,
  Medium: 2,
  Low: 1
};

export default function TasksPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [layoutId, setLayoutId] = useState<string | null>(null);

  // --- LOCAL STORAGE LOGIC ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== "undefined") {
      const savedTasks = localStorage.getItem("allTasks");
      return savedTasks ? JSON.parse(savedTasks) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("allTasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  // --- CRUD ACTIONS ---
  const handleDelete = (id: number | string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const toggleComplete = (id: number | string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // PERBAIKAN UTAMA: Gunakan TaskData untuk parameter
  const handleSaveTask = (taskData: TaskData) => {
    if (selectedTask) {
      // Logic Edit
      setTasks((prev) =>
        prev.map((t) => {
            if (t.id === selectedTask.id) {
                // Pastikan properti id & completed tetap terjaga
                return { 
                    ...t, 
                    ...taskData, 
                    id: t.id, 
                    completed: t.completed 
                } as Task;
            }
            return t;
        })
      );
    } else {
      // Logic Add Baru
      // Kita manual bikin object Task baru lengkap dengan ID
      const newTask: Task = {
          title: taskData.title,
          priority: taskData.priority,
          category: taskData.category,
          date: taskData.date,
          description: taskData.description || "", 
          id: Date.now(), // Generate ID di sini
          completed: false
      };
      setTasks((prev) => [...prev, newTask]);
    }
    closeModal();
  };

  // --- MODAL CONTROLS ---
  const openModalForCreate = (sourceId: string) => {
    setLayoutId(sourceId);
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (task: Task, sourceId: string) => {
    setLayoutId(sourceId);
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setLayoutId(null);
  };

  // --- FILTERING & STATS ---
  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter((t) => {
      const matchesFilter = filter === "All" || t.priority === filter;
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    filtered.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (priorityValues[b.priority] || 0) - (priorityValues[a.priority] || 0);
    });

    return filtered;
  }, [filter, search, tasks]);

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
    highPriority: tasks.filter((t) => t.priority === "High").length,
  };

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB] hide-scrollbar">
      <div className="p-3 md:p-6 space-y-2 md:space-y-4 bg-[#F9FAFB] min-h-screen">
        
        <TaskHeader onOpenCreate={openModalForCreate} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <StatCard title="Total Tasks" value={stats.total} />
          <StatCard title="Completed" value={stats.completed} />
          <StatCard title="Pending" value={stats.pending} />
          <StatCard title="High Priority" value={stats.highPriority} />
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 md:p-5 shadow-sm">
          
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full px-3 py-2 rounded-lg mb-2 bg-[#F3F4F6] outline-none text-gray-900 text-sm focus:ring-2 focus:ring-[#FBBF24]/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex flex-wrap items-center gap-2 mb-2 text-[#6B7280]">
            <FiFilter className="hidden sm:block" size={14} />
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar w-full sm:w-auto">
              {["All", "High", "Medium", "Low"].map((label) => (
                <FilterButton key={label} label={label} active={filter} setActive={setFilter} />
              ))}
            </div>
          </div>

          <div className="space-y-2 md:space-y-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  toggleComplete={toggleComplete}
                  handleDelete={handleDelete}
                  handleEdit={openModalForEdit}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="bg-gray-100 p-3 rounded-full mb-2">
                  <FiPlus className="text-gray-400 text-xl" />
                </div>
                <p className="text-gray-500 text-sm">No assignments yet.</p>
              </div>
            )}
          </div>

          <AnimatePresence>
            {isModalOpen && (
              <TaskModal 
                onClose={closeModal} 
                onSave={handleSaveTask} 
                task={selectedTask} 
                layoutId={layoutId} 
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}