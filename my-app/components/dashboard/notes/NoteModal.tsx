"use client";
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi"; 

export default function NoteModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("#FACC15");

  const colors = ["#FACC15", "#F5F5F5", "#1F2937", "#111827", "#FBBF24"];

  // Reset form setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setContent("");
      setColor("#FACC15");
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!title) {
      alert("Judul nggak boleh kosong, Bang!");
      return;
    }
    
    const newNote = {
      id: Date.now(),
      title,
      content,
      color,
      date: new Date().toLocaleDateString("id-ID"),
    };

    onSave(newNote); 
    onClose();       
  };

  if (!isOpen) return null;

  return (
    // 1. BACKDROP: Tambah 'animate-fade' biar background hitamnya smooth
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade">
      
      {/* 2. KOTAK MODAL: Ganti 'animate-in...' jadi 'animate-elastic' biar membal */}
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-elastic">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Create New Note</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={24} />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6">
          
          {/* Title Input */}
          <label className="block text-sm font-medium text-gray-500 mb-2">Note Title *</label>
          <input
            autoFocus
            placeholder="Enter note title"
            className="w-full p-3 border border-gray-200 rounded-lg outline-none bg-gray-50 text-gray-800 focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Content Input */}
          <label className="block text-sm font-medium text-gray-500 mt-4 mb-2">Note Content</label>
          <textarea
            placeholder="Enter your note content here..."
            className="w-full p-3 border border-gray-200 rounded-lg min-h-[120px] outline-none bg-gray-50 text-gray-800 focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all resize-none custom-scrollbar"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* Color Picker */}
          <label className="block text-sm font-medium text-gray-500 mt-4 mb-2">Note Color</label>
          <div className="flex gap-3 flex-wrap">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-all border-2 ${
                  color === c ? "border-gray-600 scale-110" : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
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

      </div>
    </div>
  );
}