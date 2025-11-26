import React from "react";
import { FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";

export default function TaskHeader({ onOpenCreate }) {
  return (
    <>
      {/* MOBILE HEADER */}
      <div className="md:hidden flex flex-col">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-[#1F2937] leading-tight">Tasks</h1>
            <p className="text-[#6B7280] text-xs mt-0.5 leading-snug">Manage your daily tasks.</p>
          </div>
          
          <motion.button
            layoutId="fab-add-task"
            onClick={() => onOpenCreate('fab-add-task')}
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
        
        <motion.button
          layoutId="btn-add-task"
          onClick={() => onOpenCreate('btn-add-task')}
          className="flex items-center justify-center gap-2 bg-[#FBBF24] px-4 py-2 rounded-lg text-white font-medium h-10 shadow-sm hover:bg-[#F59E0B]"
          whileTap={{ scale: 0.95 }}
        >
          <FiPlus />
          <span>Add New Task</span>
        </motion.button>
      </div>
    </>
  );
}