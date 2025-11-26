import React from "react";
import { motion } from "framer-motion";
import { IconCloseInternal } from "./EventIcons";
import CalendarWidget from "@/components/CalendarWidget";

// 1. Definisikan tipe data Props
interface MobileCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 2. Pasang Interface di sini
export default function MobileCalendarModal({ isOpen, onClose }: MobileCalendarModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:hidden">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div 
        layoutId="btn-calendar-mobile"
        initial={false}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden relative z-10"
      >
        <div className="flex justify-between items-center p-3 border-b">
          <h3 className="font-semibold text-gray-800 text-sm">Calendar</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <IconCloseInternal />
          </button>
        </div>
        <div className="p-3">
          <CalendarWidget />
        </div>
      </motion.div>
    </div>
  );
}