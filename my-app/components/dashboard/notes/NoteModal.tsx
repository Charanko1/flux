"use client";

import React, { useState, useEffect } from "react";
import { FiX, FiAlertCircle } from "react-icons/fi"; 
import { motion, AnimatePresence } from "framer-motion"; 

interface NewNoteData {
  title: string;
  content: string;
  color: string;
  date: string;
}

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: NewNoteData) => void;
  layoutId?: string | null; 
}

const MAX_CHARS = 300;

export default function NoteModal({ isOpen, onClose, onSave, layoutId }: NoteModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("#FACC15");
  
  // State Error Validation
  const [error, setError] = useState("");

  const colors = ["#FACC15", "#F5F5F5", "#1F2937", "#111827", "#FBBF24"];

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setContent("");
      setColor("#FACC15");
      setError(""); 
    }
  }, [isOpen]);

  const handleSave = () => {
    // 1. Validasi Custom (Inline Error)
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    
    const newNote: NewNoteData = {
      title,
      content,
      color,
      // 2. Format Tanggal Inggris
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    onSave(newNote); 
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setContent(text);
    }
  };

  // Reset error saat user mengetik
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (error) setError(""); 
  };

  if (!isOpen && !layoutId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      
      <motion.div 
        layoutId={layoutId || undefined} 
        initial={!layoutId ? { opacity: 0, scale: 0.9 } : undefined}
        animate={!layoutId ? { opacity: 1, scale: 1 } : undefined}
        exit={!layoutId ? { opacity: 0, scale: 0.9 } : undefined}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col"
      >
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Create New Note</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6 flex-1">
          
          {/* TITLE INPUT & ERROR MESSAGE */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Note Title <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Enter note title"
              className={`w-full p-3 border rounded-lg outline-none bg-gray-50 text-gray-800 transition-all ${
                error 
                  ? "border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50" 
                  : "border-gray-200 focus:ring-2 focus:ring-amber-400 focus:bg-white"
              }`}
              value={title}
              onChange={handleTitleChange}
            />
            
            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium"
                >
                  <FiAlertCircle /> {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* CONTENT INPUT & COUNTER */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Note Content 
              <span className={`float-right text-xs ${content.length === MAX_CHARS ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                {content.length}/{MAX_CHARS}
              </span>
            </label>
            
            <textarea
              placeholder="Enter your note content here..."
              maxLength={MAX_CHARS}
              className="w-full p-3 border border-gray-200 rounded-lg min-h-[120px] outline-none bg-gray-50 text-gray-800 focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all resize-none custom-scrollbar"
              value={content}
              onChange={handleContentChange}
            />
          </div>

          {/* COLOR PICKER */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Note Color</label>
            <div className="flex gap-3 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all border-2 ${
                    color === c ? "border-gray-600 scale-110 shadow-sm" : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label="Select color"
                />
              ))}
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 text-sm font-medium text-amber-900 bg-amber-300 hover:bg-amber-400 rounded-lg shadow-sm transition-colors"
          >
            Save Note
          </button>
        </div>

      </motion.div>
    </div>
  );
}