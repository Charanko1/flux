"use client";

import React, { useState, useEffect } from "react";
import { FiX, FiTrash2, FiEdit2, FiCheck } from "react-icons/fi";
import { motion } from "framer-motion"; 

// 1. Definisikan Tipe Data Note
interface Note {
  id: string | number;
  title: string;
  content: string;
  date: string;
  color: string; 
  category?: string;
  priority?: string;
}

// 2. Definisikan Props Komponen
interface NoteDetailModalProps {
  onClose: () => void;
  note: Note;
  onDelete: (id: string | number) => void;
  onUpdate: (note: Note) => void;
  layoutId?: string | null; 
}

export default function NoteDetailModal({ onClose, note, onDelete, onUpdate, layoutId }: NoteDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (note) {
      setEditTitle(note.title);
      setEditContent(note.content);
      setIsEditing(false);
    }
  }, [note]);

  const getTextColor = (bgColor: string) => {
    return ["#1F2937", "#111827"].includes(bgColor) ? "text-white" : "text-gray-800";
  };

  const handleSave = () => {
    // Kirim data update ke Parent (NotesPage)
    onUpdate({
      ...note,
      title: editTitle,
      content: editContent,
    });
    setIsEditing(false);
  };

  if (!note) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      {/* 1. BACKDROP */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      {/* 2. KOTAK MODAL (Morphing Container) */}
      <motion.div 
        layoutId={layoutId || undefined} 
        className="relative w-full max-w-md rounded-xl shadow-2xl flex flex-col h-auto max-h-[80vh] overflow-hidden z-10"
        style={{ backgroundColor: note.color }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      >
        
        {/* 3. ISI KONTEN (Inner Wrapper untuk Animasi Fade Out) */}
        {/* Ini kuncinya: Isi konten akan hilang (opacity 0) lebih cepat daripada kotak mengecil */}
        <motion.div 
          className="flex flex-col h-full overflow-y-auto custom-scrollbar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.1 } }} 
          exit={{ opacity: 0, transition: { duration: 0.05 } }} 
        >
            {/* Header Actions (Tombol Edit/Delete/Close) */}
            <div className="absolute top-2 right-2 flex gap-1 z-10">
            {isEditing ? (
                <button 
                onClick={handleSave}
                className="p-1.5 rounded-full transition-all bg-green-500 text-white hover:bg-green-600 shadow-sm"
                title="Save Changes"
                >
                <FiCheck size={16} />
                </button>
            ) : (
                <>
                <button 
                    onClick={() => setIsEditing(true)}
                    className={`p-1.5 rounded-full transition-all bg-black/5 hover:bg-black/20 ${getTextColor(note.color)}`}
                    title="Edit Note"
                >
                    <FiEdit2 size={16} />
                </button>

                <button 
                    onClick={() => onDelete(note.id)}
                    className={`p-1.5 rounded-full transition-all bg-black/5 hover:bg-red-500 hover:text-white ${getTextColor(note.color)}`}
                    title="Delete Note"
                >
                    <FiTrash2 size={16} />
                </button>
                </>
            )}

            <button 
                onClick={onClose}
                className={`p-1.5 rounded-full transition-all bg-black/5 hover:bg-black/20 ${getTextColor(note.color)}`}
            >
                <FiX size={16} />
            </button>
            </div>

            {/* Content Body */}
            <div className="p-6 pt-8">
            
            <p className={`text-xs font-medium opacity-60 mb-2 ${getTextColor(note.color)}`}>
                {note.date} {isEditing && "(Editing...)"}
            </p>

            {isEditing ? (
                <div className="mt-2">
                <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={`w-full bg-black/5 border-0 rounded-md p-2 text-xl font-bold mb-2 focus:ring-2 focus:ring-amber-400 outline-none ${getTextColor(note.color)} placeholder-gray-500`}
                    placeholder="Note Title"
                    autoFocus
                />
                
                <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className={`w-full h-60 bg-black/5 border-0 rounded-md p-2 text-base leading-relaxed resize-none focus:ring-2 focus:ring-amber-400 outline-none custom-scrollbar ${getTextColor(note.color)} placeholder-gray-500`}
                    placeholder="Note content..."
                />
                </div>
            ) : (
                <>
                {/* Judul dengan Layout ID agar morphing teks mulus */}
                <motion.h2 
                    layoutId={`note-title-${note.id}`} 
                    className={`text-xl font-bold mb-4 leading-tight break-words pr-20 ${getTextColor(note.color)}`}
                >
                    {note.title}
                </motion.h2>

                <div className={`text-base leading-relaxed whitespace-pre-wrap font-normal break-words break-all ${getTextColor(note.color)} opacity-90`}>
                    {note.content}
                </div>
                </>
            )}
            </div>
        </motion.div>
      </motion.div>
    </div>
  );
}