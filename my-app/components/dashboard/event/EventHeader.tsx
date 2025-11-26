import React from "react";
import { motion } from "framer-motion";
import { IconPlus } from "@/components/icons";
import { IconCalendarInternal } from "./EventIcons";

// 1. Definisikan tipe data Props
interface EventHeaderProps {
  onOpenMobileCalendar: () => void;      // Fungsi tanpa parameter
  onOpenCreate: (sourceId: string) => void; // Fungsi yang menerima string
}

// 2. Pasang Interface di sini
export default function EventHeader({ onOpenMobileCalendar, onOpenCreate }: EventHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-3">
      <div>
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Events Dashboard</h2>
        <p className="text-xs md:text-sm text-gray-500 mt-0.5">Manage and track all your events</p>
      </div>

      <div className="flex gap-2 sm:hidden">
        {/* TOMBOL KALENDER (ANIMASI MORPH) */}
        <motion.button
          layoutId="btn-calendar-mobile"
          onClick={onOpenMobileCalendar}
          className="flex items-center justify-center w-9 h-9 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <IconCalendarInternal />
        </motion.button>
        
        {/* TOMBOL ADD (ANIMASI MORPH) */}
        <motion.button
          layoutId="fab-add-event"
          onClick={() => onOpenCreate("fab-add-event")}
          className="flex items-center justify-center w-9 h-9 bg-gray-900 text-white rounded-lg shadow-sm hover:bg-gray-800 transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <IconPlus />
        </motion.button>
      </div>
    </div>
  );
}