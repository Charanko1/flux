import React from "react";
import { FiTrash2, FiEdit2 } from "react-icons/fi";
import { motion } from "framer-motion";

export default function TaskItem({ task, toggleComplete, handleDelete, handleEdit }) {
  const priorityColors = {
    High: "bg-[#EF4444] text-white",
    Medium: "bg-[#FACC15] text-white",
    Low: "bg-[#22C55E] text-white",
  };

  // Buat Layout ID unik untuk setiap task
  const itemLayoutId = `task-card-${task.id}`;

  return (
    <motion.div
      layoutId={itemLayoutId}
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