"use client";
import React, { useState, useMemo, useEffect } from "react";
import { FiTrash2, FiFilter, FiPlus } from "react-icons/fi";
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

  const [tasks, setTasks] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTasks = localStorage.getItem("allTasks");
      if (savedTasks) {
        return JSON.parse(savedTasks);
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("allTasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  const handleDelete = id => setTasks(prev => prev.filter(t => t.id !== id));

  const toggleComplete = id => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter(t => {
      const matchesFilter = filter === "All" || t.priority === filter;
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    filtered.sort((a, b) => {
      const priorityB = priorityValues[b.priority] || 0;
      const priorityA = priorityValues[a.priority] || 0;
      return priorityB - priorityA;
    });

    return filtered;
  }, [filter, search, tasks]);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    highPriority: tasks.filter(t => t.priority === "High").length
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModalForCreate = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const addTask = task => {
    setTasks(prev => [...prev, { ...task, id: Date.now(), completed: false }]);
    closeModal();
  };

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB] hide-scrollbar">
      {/* UBAHAN: Padding p-3, space-y-2 (Sangat Rapat) */}
      <div className="p-3 md:p-6 space-y-2 md:space-y-4 bg-[#F9FAFB] min-h-screen">

        {/* MOBILE — TITLE + ADD BUTTON */}
        <div className="md:hidden flex flex-col">
          <div className="flex items-start justify-between">
            {/* LEFT: TITLE + DESCRIPTION */}
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold text-[#1F2937] leading-tight">
                Tasks
              </h1>
              <p className="text-[#6B7280] text-xs mt-0.5 leading-snug">
                Manage your daily tasks.
              </p>
            </div>

            {/* RIGHT: ADD BUTTON */}
            <button
              onClick={openModalForCreate}
              className="flex items-center justify-center bg-[#FBBF24] px-3 py-1.5 rounded-lg text-white h-8 shadow-sm active:scale-95 transition-transform ml-2"
            >
              <FiPlus size={18} />
            </button>
          </div>
        </div>

        {/* DESKTOP — TITLE + ADD BUTTON */}
        <div className="hidden md:flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#1F2937]">Tasks</h1>
            <p className="text-[#6B7280]">
              Manage your daily tasks and stay productive.
            </p>
          </div>

          <button
            onClick={openModalForCreate}
            className="flex items-center justify-center gap-2 bg-[#FBBF24] px-4 py-2 rounded-lg text-white font-medium h-10 shadow-sm active:scale-95 transition-transform"
          >
            <FiPlus />
            <span>Add New Task</span>
          </button>
        </div>

        {/* STATS */}
        {/* UBAHAN: gap-2 tetap, tapi card padding dikecilin di komponen StatCard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <StatCard title="Total Tasks" value={stats.total} />
          <StatCard title="Completed" value={stats.completed} />
          <StatCard title="Pending" value={stats.pending} />
          <StatCard title="High Priority" value={stats.highPriority} />
        </div>

        {/* TASK LIST BOX */}
        {/* UBAHAN: padding p-3 (sebelumnya p-4) */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 md:p-5 shadow-sm">

          {/* UBAHAN: mb-2 (sebelumnya mb-4) biar nempel sama filter */}
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full px-3 py-2 rounded-lg mb-2 bg-[#F3F4F6] outline-none text-gray-900 text-sm focus:ring-2 focus:ring-[#FBBF24]/50"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {/* FILTERS */}
          {/* UBAHAN: mb-2 (sebelumnya mb-6) biar nempel sama list task */}
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
          {/* UBAHAN: space-y-2 (sebelumnya space-y-3) */}
          <div className="space-y-2 md:space-y-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  toggleComplete={toggleComplete}
                  handleDelete={handleDelete}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="bg-gray-100 p-3 rounded-full mb-2">
                  <FiPlus className="text-gray-400 text-xl" />
                </div>
                <p className="text-gray-500 text-sm">
                  No assignments yet.
                </p>
              </div>
            )}
          </div>

          {isModalOpen && <TaskModal onClose={closeModal} onSave={addTask} />}
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

  return (
    <button
      onClick={() => setActive(label)}
      // UBAHAN: py-1 text-xs (lebih kecil)
      className={`px-3 py-1 rounded-md border text-xs whitespace-nowrap transition-colors ${
        isActive
          ? "bg-[#FBBF24] border-[#FBBF24] text-white"
          : "bg-white border-[#E5E7EB] text-[#374151] hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}

function TaskItem({ task, toggleComplete, handleDelete }) {
  const priorityColors = {
    High: "bg-[#EF4444]",
    Medium: "bg-[#FACC15] text-black",
    Low: "bg-[#22C55E]"
  };

  return (
    // UBAHAN: p-3 (sebelumnya p-4)
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-[#E5E7EB] p-3 rounded-xl gap-2 sm:gap-4 shadow-sm hover:border-[#FBBF24]/50 transition-colors">
      
      <div className="flex items-start gap-3 w-full">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleComplete(task.id)}
          className="w-4 h-4 mt-1 text-[#FBBF24] border-gray-300 focus:ring-[#FBBF24]"
        />

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${
            task.completed ? "line-through text-gray-400" : "text-[#1F2937]"
          }`}>
            {task.title}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs mt-1 text-[#6B7280]">
            <span className={`px-1.5 py-0.5 rounded text-white text-[9px] sm:text-[10px] font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>

            <span>{task.date}</span>

            <span className="hidden sm:inline text-gray-300">•</span>

            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
              {task.category}
            </span>
          </div>
        </div>
      </div>

      {/* MOBILE DELETE */}
      <div className="flex sm:hidden border-t border-gray-100 pt-2 mt-1 justify-end">
        <button
          onClick={() => handleDelete(task.id)}
          className="text-xs text-red-500 flex items-center gap-1"
        >
          <FiTrash2 size={12} /> Delete
        </button>
      </div>

      {/* DESKTOP DELETE */}
      <button
        onClick={() => handleDelete(task.id)}
        className="hidden sm:block text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
      >
        <FiTrash2 size={16} />
      </button>
    </div>
  );
}