"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";

// 1. Definisikan Tipe Data Task
// Gunakan export agar bisa di-import di page.tsx jika perlu, meski page.tsx punya definisinya sendiri
export interface TaskData {
  id?: number | string; // Optional karena task baru belum punya ID
  title: string;
  description?: string; // Optional agar tidak error jika undefined
  priority: string;
  category: string;
  date: string;
  completed?: boolean;
}

// 2. Definisikan Interface Props
interface TaskModalProps {
  task: TaskData | null; // Bisa null jika mode create
  onSave: (task: TaskData) => void;
  onClose: () => void;
  layoutId?: string | null;
}

export default function TaskModal({ task, onSave, onClose, layoutId }: TaskModalProps) {
  // State awal form
  const [formData, setFormData] = useState<TaskData>({
    title: "",
    description: "",
    priority: "Medium",
    category: "Work",
    date: "",
  });

  // Update form saat prop task berubah
  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        description: task.description || "", // Pastikan description string kosong jika undefined
      });
    } else {
      // Reset form jika task null (mode create)
      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        category: "Work",
        date: "",
      });
    }
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputStyle =
    "w-full rounded-lg bg-white px-3 py-2 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all";
  const labelStyle = "block text-sm font-medium text-gray-800 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      {/* BACKDROP */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* MODAL CARD */}
      <motion.div 
        layoutId={layoutId || undefined} // Magic Motion ID
        initial={!layoutId ? { opacity: 0, scale: 0.9 } : undefined}
        animate={!layoutId ? { opacity: 1, scale: 1 } : undefined}
        exit={!layoutId ? { opacity: 0, scale: 0.9 } : undefined}
        transition={{ 
          type: "spring", 
          stiffness: 350, 
          damping: 25 
        }} 
        className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative z-10 overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {task ? "Edit Task" : "Add New Task"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className={labelStyle}>
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="What needs to be done?"
              className={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelStyle}>Description</label>
            <textarea
              name="description"
              value={formData.description || ""} // Fallback ke string kosong
              onChange={handleChange}
              placeholder="Add details (optional)..."
              className={`${inputStyle} min-h-[100px] resize-none`}
              rows={3}
            />
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={inputStyle}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className={labelStyle}>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={inputStyle}
              >
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Shopping">Shopping</option>
                <option value="Health">Health</option>
                <option value="Study">Study</option>
                <option value="Family">Family</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className={labelStyle}>
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#FBBF24] hover:bg-yellow-500 rounded-lg shadow-sm hover:shadow transition-all transform active:scale-95"
            >
              {task ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}