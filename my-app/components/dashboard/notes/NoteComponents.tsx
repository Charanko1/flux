import React from "react";
import Link from "next/link";
import { FiSearch, FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";
import { Note } from "./types"; // Sesuaikan path import

// --- HELPER WARNA ---
export const getTextColor = (bgColor: string) => {
  return ["#1F2937", "#111827"].includes(bgColor) ? "text-white" : "text-gray-800";
};

// --- SKELETON LOADER ---
export const SkeletonCard = () => (
  <div className="rounded-xl p-3 border border-gray-200 bg-white h-32 flex flex-col animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="space-y-2 flex-1">
      <div className="h-2 bg-gray-100 rounded"></div>
      <div className="h-2 bg-gray-100 rounded w-5/6"></div>
    </div>
    <div className="h-2 bg-gray-100 rounded w-1/4 mt-2"></div>
  </div>
);

// --- HEADER COMPONENT ---
interface NotesHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenCreate: () => void;
  isCreateModalOpen: boolean;
}

export const NotesHeader: React.FC<NotesHeaderProps> = ({ 
  searchQuery, setSearchQuery, onOpenCreate, isCreateModalOpen 
}) => (
  <div className="px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
    <Link href="/dashboard" className="text-gray-600 hover:text-black text-sm flex items-center gap-1 transition-colors self-start md:self-center">
      ← Kembali ke Dashboard
    </Link>

    <div className="flex items-center gap-3 w-full md:w-auto">
      <div className="relative w-full md:w-64 group">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-400 transition-colors" />
        <input 
          type="text" 
          placeholder="Cari catatan..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100 transition-all shadow-sm"
        />
      </div>

      <motion.button
        layoutId="btn-add-note"
        onClick={onOpenCreate}
        className="px-4 py-2 bg-amber-300 hover:bg-amber-400 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors active:scale-95 whitespace-nowrap"
        style={{ opacity: isCreateModalOpen ? 0 : 1 }}
      >
        <span className="text-lg font-semibold">+</span> <span className="hidden sm:inline">Add Note</span>
      </motion.button>
    </div>
  </div>
);

// --- NOTE CARD COMPONENT ---
interface NoteCardProps {
  note: Note;
  onClick: (note: Note) => void;
  onDelete: (id: string | number) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onClick, onDelete }) => (
  <motion.div 
    layoutId={`note-card-${note.id}`}
    onClick={() => onClick(note)}
    className="group cursor-pointer"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -4 }}
  >
    <div
      className={`rounded-xl p-3 shadow-sm hover:shadow-md border relative h-32 flex flex-col transition-colors ${getTextColor(note.color)}`}
      style={{
        backgroundColor: note.color,
        borderColor: note.color === "#F5F5F5" ? "#E0E0E0" : "transparent",
      }}
    >
      {/* Judul */}
      <motion.h2 layoutId={`note-title-${note.id}`} className={`font-bold text-sm mb-1 tracking-tight line-clamp-1 ${getTextColor(note.color)}`}>
        {note.title}
      </motion.h2>
      
      {/* Konten */}
      <p className={`text-xs whitespace-pre-line leading-snug line-clamp-3 break-all overflow-hidden ${getTextColor(note.color)} opacity-85`}>
        {note.content}
      </p>
      
      <div className="flex-1"></div>

      {/* Tanggal */}
      <p className={`text-[10px] mt-2 ${getTextColor(note.color)} opacity-60`}>
        {note.date}
      </p>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(note.id);
        }}
        className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-black/10 ${
          getTextColor(note.color) === "text-white" ? "text-white hover:text-red-300" : "text-red-500 hover:text-red-700"
        }`}
      >
        <FiTrash2 size={14} />
      </button>
    </div>
  </motion.div>
);