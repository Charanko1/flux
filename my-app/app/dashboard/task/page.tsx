"use client";
import React, { useState, useMemo, useEffect } from "react";
import { FiTrash2, FiFilter, FiPlus, FiEdit2 } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion"; // Import Framer Motion
import TaskModal from '@/components/dashboard/task/TaskModal';
import StatCard from '@/components/dashboard/task/StatCard';

// --- HELPER OBJECT ---
const priorityValues = {
  High: 3,
  Medium: 2,
  Low: 1
};

export default function TasksPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  // Load tasks from localStorage
  const [tasks, setTasks] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTasks = localStorage.getItem("allTasks");
      if (savedTasks) {
        return JSON.parse(savedTasks);
      }
    }
    return [];
  });

  // Save tasks to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("allTasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  // --- CRUD ACTIONS ---

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this task?")) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const toggleComplete = (id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const handleSaveTask = (taskData) => {
    if (selectedTask) {
      // Logic Edit
      setTasks((prev) =>
        prev.map((t) => (t.id === selectedTask.id ? { ...taskData, id: t.id, completed: t.completed } : t))
      );
    } else {
      // Logic Add Baru
      setTasks((prev) => [...prev, { ...taskData, id: Date.now(), completed: false }]);
    }
    closeModal();
  };

  // --- MODAL CONTROLS ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [layoutId, setLayoutId] = useState(null); // ID untuk animasi morphing

  const openModalForCreate = (sourceId) => {
    setLayoutId(sourceId); // Set ID tombol Add
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  // UBAHAN: Terima layoutId dari item task yang diklik
  const openModalForEdit = (task, sourceId) => {
    setLayoutId(sourceId); // Set ID Task Card
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setLayoutId(null);
  };

  // --- FILTERING ---
  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter((t) => {
      const matchesFilter = filter === "All" || t.priority === filter;
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    filtered.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const priorityB = priorityValues[b.priority] || 0;
      const priorityA = priorityValues[a.priority] || 0;
      return priorityB - priorityA;
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
        
        {/* MOBILE HEADER */}
        <div className="md:hidden flex flex-col">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold text-[#1F2937] leading-tight">Tasks</h1>
              <p className="text-[#6B7280] text-xs mt-0.5 leading-snug">Manage your daily tasks.</p>
            </div>
            
            {/* TOMBOL ADD MOBILE */}
            <motion.button
              layoutId="fab-add-task"
              onClick={() => openModalForCreate('fab-add-task')}
              className="flex items-center justify-center bg-[#FBBF24] px-3 py-1.5 rounded-lg text-white h-8 shadow-sm active:scale-95 ml-2"
              whileTap={{ scale: 0.9 }}
            >
              <FiPlus size={18} />
            </motion.button>
          </div>
        </div>

        {/* DESKTOP HEADER */}
        <div className="hidden md:flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#1F2937]">Tasks</h1>
            <p className="text-[#6B7280]">Manage your daily tasks and stay productive.</p>
          </div>
          
          {/* TOMBOL ADD DESKTOP */}
          <motion.button
            layoutId="btn-add-task"
            onClick={() => openModalForCreate('btn-add-task')}
            className="flex items-center justify-center gap-2 bg-[#FBBF24] px-4 py-2 rounded-lg text-white font-medium h-10 shadow-sm hover:bg-[#F59E0B]"
            whileTap={{ scale: 0.95 }}
          >
            <FiPlus />
            <span>Add New Task</span>
          </motion.button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <StatCard title="Total Tasks" value={stats.total} />
          <StatCard title="Completed" value={stats.completed} />
          <StatCard title="Pending" value={stats.pending} />
          <StatCard title="High Priority" value={stats.highPriority} />
        </div>

        {/* TASK LIST BOX */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 md:p-5 shadow-sm">
          
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full px-3 py-2 rounded-lg mb-2 bg-[#F3F4F6] outline-none text-gray-900 text-sm focus:ring-2 focus:ring-[#FBBF24]/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* FILTERS */}
          <div className="flex flex-wrap items-center gap-2 mb-2 text-[#6B7280]">
            <FiFilter className="hidden sm:block" size={14} />
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar w-full sm:w-auto">
              <FilterButton label="All" active={filter} setActive={setFilter} />
              <FilterButton label="High" active={filter} setActive={setFilter} />
              <FilterButton label="Medium" active={filter} setActive={setFilter} />
              <FilterButton label="Low" active={filter} setActive={setFilter} />
            </div>
          </div>

          {/* TASK LIST */}
          <div className="space-y-2 md:space-y-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  toggleComplete={toggleComplete}
                  handleDelete={handleDelete}
                  handleEdit={openModalForEdit} // Pass fungsi edit
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

          {/* MODAL WRAPPER */}
          <AnimatePresence>
            {isModalOpen && (
              <TaskModal 
                onClose={closeModal} 
                onSave={handleSaveTask} 
                task={selectedTask} 
                layoutId={layoutId} // Pass layoutId agar modal tahu sumber animasinya
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------- */
/* COMPONENTS */
/* --------------------------------------------- */

function FilterButton({ label, active, setActive }) {
  const isActive = active === label;
  let activeStyle = "bg-gray-800 border-gray-800 text-white"; 
  
  if (label === "High") activeStyle = "bg-[#EF4444] border-[#EF4444] text-white"; 
  else if (label === "Medium") activeStyle = "bg-[#FACC15] border-[#FACC15] text-white"; 
  else if (label === "Low") activeStyle = "bg-[#22C55E] border-[#22C55E] text-white"; 

  return (
    <button
      onClick={() => setActive(label)}
      className={`px-3 py-1 rounded-md border text-xs whitespace-nowrap transition-all font-medium ${
        isActive ? activeStyle + " shadow-sm transform scale-105" : "bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}

// UBAHAN DI SINI: Mengubah div biasa menjadi motion.div dengan layoutId
function TaskItem({ task, toggleComplete, handleDelete, handleEdit }) {
  const priorityColors = {
    High: "bg-[#EF4444] text-white",
    Medium: "bg-[#FACC15] text-white",
    Low: "bg-[#22C55E] text-white",
  };

  // Buat Layout ID unik untuk setiap task
  const itemLayoutId = `task-card-${task.id}`;

  return (
    <motion.div
      layoutId={itemLayoutId} // INI KUNCINYA: ID unik untuk animasi morphing
      className="group flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-[#E5E7EB] p-3 rounded-xl gap-2 sm:gap-4 shadow-sm hover:border-[#FBBF24]/50 transition-colors relative z-0"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="flex items-start gap-3 w-full">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleComplete(task.id)}
          className="w-4 h-4 mt-1 text-[#FBBF24] border-gray-300 focus:ring-[#FBBF24] rounded cursor-pointer"
        />
        {/* Klik text untuk edit, kirim layoutId */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleEdit(task, itemLayoutId)}>
          <p className={`text-sm font-medium truncate transition-all ${task.completed ? "line-through text-gray-400" : "text-[#1F2937]"}`}>
            {task.title}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs mt-1 text-[#6B7280]">
            <span className={`px-1.5 py-0.5 rounded ${priorityColors[task.priority]} text-[9px] sm:text-[10px] font-medium`}>
              {task.priority}
            </span>
            <span>{task.date}</span>
            <span className="hidden sm:inline text-gray-300">•</span>
            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{task.category}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-2 sm:mt-0 border-t sm:border-t-0 border-gray-100 pt-2 sm:pt-0 w-full sm:w-auto">
        {/* Klik tombol edit, kirim layoutId */}
        <button onClick={() => handleEdit(task, itemLayoutId)} className="text-gray-400 hover:text-[#FBBF24] transition-colors p-1.5 rounded-full hover:bg-yellow-50">
          <FiEdit2 size={16} />
        </button>
        <button onClick={() => handleDelete(task.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50">
          <FiTrash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}