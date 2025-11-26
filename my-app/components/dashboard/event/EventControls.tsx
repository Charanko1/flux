import React from "react";
import { motion } from "framer-motion";
import { IconSearch, IconPlus } from "@/components/icons";

// 1. Definisikan tipe data untuk props
interface EventControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  onOpenCreate: (sourceId: string) => void;
}

// 2. Pasang Interface di sini
export default function EventControls({ 
  searchTerm, 
  setSearchTerm, 
  filterStatus, 
  setFilterStatus, 
  onOpenCreate 
}: EventControlsProps) {
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2 sm:gap-3">
      <div className="flex flex-1 gap-2 w-full sm:max-w-lg">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-700 shadow-sm"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconSearch />
          </span>
        </div>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 shadow-sm cursor-pointer hover:bg-gray-50"
        >
          <option value="all">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      
      {/* TOMBOL ADD DESKTOP (ANIMASI) */}
      <div className="hidden sm:flex w-auto">
        <motion.button
          layoutId="btn-add-event"
          onClick={() => onOpenCreate("btn-add-event")}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap"
          whileTap={{ scale: 0.95 }}
        >
          <IconPlus />
          <span>New Event</span>
        </motion.button>
      </div>
    </div>
  );
}