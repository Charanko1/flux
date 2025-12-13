"use client";

import React, { useState, useMemo, useEffect } from "react";
import { FiFilter, FiPlus, FiLoader } from "react-icons/fi";
import { AnimatePresence, motion, Variants } from "framer-motion";

// Components Imports
import TaskModal, { TaskData } from "@/components/dashboard/task/TaskModal";
import StatCard from "@/components/dashboard/task/StatCard";
import TaskItem from "@/components/dashboard/task/TaskItem";
import FilterButton from "@/components/dashboard/task/FilterButton";
import TaskHeader from "@/components/dashboard/task/TaskHeader";

export interface Task {
  id: number | string;
  title: string;
  priority: string;
  completed: boolean;
  date: string;
  category: string;
  description?: string;
}

const priorityValues: Record<string, number> = { High: 3, Medium: 2, Low: 1 };

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 15 },
  },
};

export default function TasksPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [layoutId, setLayoutId] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. FETCH TASKS DARI API (GET)
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/dashboard/task", {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          const formattedTasks = data.map((t: any) => ({
            ...t,
            id: t._id,
          }));
          setTasks(formattedTasks);
        } else {
          console.error("Gagal fetch tasks:", response.status);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // 2. DELETE TASK (API)
  const handleDelete = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      await fetch(`/api/dashboard/task?id=${id}`, { method: "DELETE" });
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Gagal menghapus task.");
    }
  };

  // 3. TOGGLE COMPLETE (API + notifikasi task_completed)
  const toggleComplete = async (id: number | string) => {
    const taskToUpdate = tasks.find((t) => t.id === id);
    if (!taskToUpdate) return;

    const newStatus = !taskToUpdate.completed;

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: newStatus } : t))
    );

    try {
      const res = await fetch("/api/dashboard/task", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: newStatus }),
      });

      if (!res.ok) {
        console.error("Update failed status:", res.status);
      }

      // jika baru selesai → buat notifikasi task_completed
      if (newStatus) {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "task",
            event: "task_completed",
            title: "Task Selesai",
            description: `Task "${taskToUpdate.title}" telah ditandai selesai.`,
            taskId: id,
          }),
        });
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  // 4. SAVE / EDIT TASK (API + notifikasi task_created)
  const handleSaveTask = async (taskData: TaskData) => {
    try {
      if (selectedTask) {
        // --- EDIT TASK (PUT) ---
        const response = await fetch("/api/dashboard/task", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedTask.id, ...taskData }),
        });

        if (response.ok) {
          const updatedTask = await response.json();
          setTasks((prev) =>
            prev.map((t) =>
              t.id === updatedTask._id ? { ...updatedTask, id: updatedTask._id } : t
            )
          );
        }
      } else {
        // --- ADD NEW TASK (POST) ---
        const response = await fetch("/api/dashboard/task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });

        if (response.ok) {
          const newTask = await response.json();
          setTasks((prev) => [{ ...newTask, id: newTask._id }, ...prev]);

          // buat notifikasi task_created
          await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              source: "task",
              event: "task_created",
              title: "Task Baru Dibuat",
              description: `Task "${newTask.title}" telah ditambahkan dengan due date ${newTask.date}.`,
              taskId: newTask._id,
            }),
          });
        }
      }
      closeModal();
    } catch (error) {
      console.error("Save failed:", error);
      alert("Gagal menyimpan task.");
    }
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
      return (
        (priorityValues[b.priority] || 0) -
        (priorityValues[a.priority] || 0)
      );
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
    <div className="flex flex-col w-full bg-[#F9FAFB]">
      <motion.div
        className="p-3 md:p-6 space-y-2 md:space-y-4 bg-[#F9FAFB] min-h-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <TaskHeader onOpenCreate={openModalForCreate} />
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3"
          variants={itemVariants}
        >
          <StatCard title="Total Tasks" value={stats.total} />
          <StatCard title="Completed" value={stats.completed} />
          <StatCard title="Pending" value={stats.pending} />
          <StatCard title="High Priority" value={stats.highPriority} />
        </motion.div>

        <motion.div
          className="bg-white border border-[#E5E7EB] rounded-xl p-3 md:p-5 shadow-sm"
          variants={itemVariants}
        >
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full px-3 py-2 rounded-lg mb-2 bg-[#F3F4F6] outline-none text-gray-900 text-sm focus:ring-2 focus:ring-[#FBBF24]/50 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex flex-wrap items-center gap-2 mb-2 text-[#6B7280]">
            <FiFilter className="hidden sm:block" size={14} />
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar w-full sm:w-auto">
              {["All", "High", "Medium", "Low"].map((label) => (
                <FilterButton
                  key={label}
                  label={label}
                  active={filter}
                  setActive={setFilter}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2 md:space-y-3">
            {isLoading ? (
              <div className="flex justify-center items-center py-10 text-gray-400">
                <FiLoader className="animate-spin text-2xl" />
              </div>
            ) : filteredTasks.length > 0 ? (
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
                <p className="text-gray-500 text-sm">No assignments.</p>
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
        </motion.div>
      </motion.div>

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
