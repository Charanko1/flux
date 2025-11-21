"use client";
import React, { useState, useEffect } from "react";
import { FiX, FiTrash2, FiEdit2, FiCheck } from "react-icons/fi";

export default function NoteDetailModal({ isOpen, onClose, note, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (note) {
      setEditTitle(note.title);
      setEditContent(note.content);
      setIsEditing(false);
    }
  }, [note, isOpen]);

  if (!isOpen || !note) return null;

  const getTextColor = (bgColor) => {
    return ["#1F2937", "#111827"].includes(bgColor) ? "text-white" : "text-gray-800";
  };

  const handleSave = () => {
    onUpdate({
      ...note,
      title: editTitle,
      content: editContent,
    });
    setIsEditing(false);
  };

  return (
    // 1. BACKGROUND: Pakai 'animate-fade' biar munculnya halus barengan sama kotak
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade">
      
      {/* 2. KOTAK MODAL: Pakai 'animate-elastic' biar dia loncat membesar dari tengah */}
      <div 
        className="relative w-full max-w-md rounded-xl shadow-2xl flex flex-col h-auto max-h-[80vh] overflow-y-auto custom-scrollbar animate-elastic"
        style={{ backgroundColor: note.color }}
      >
        
        {/* Header Actions */}
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
            onClick={() => {
                setIsEditing(false);
                onClose();
            }}
            className={`p-1.5 rounded-full transition-all bg-black/5 hover:bg-black/20 ${getTextColor(note.color)}`}
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Content Wrapper */}
        <div className="p-5">
          
          <p className={`text-xs font-medium opacity-60 mb-1 ${getTextColor(note.color)}`}>
            {note.date} {isEditing && "(Editing...)"}
          </p>

          {isEditing ? (
            <div className="mt-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className={`w-full bg-black/5 border-0 rounded-md p-2 text-xl font-bold mb-2 focus:ring-2 focus:ring-amber-400 outline-none ${getTextColor(note.color)} placeholder-gray-500`}
                placeholder="Judul Catatan"
              />
              
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className={`w-full h-40 bg-black/5 border-0 rounded-md p-2 text-sm leading-snug resize-none focus:ring-2 focus:ring-amber-400 outline-none custom-scrollbar ${getTextColor(note.color)} placeholder-gray-500`}
                placeholder="Isi catatan..."
              />
            </div>
          ) : (
            <>
              <h2 className={`text-xl font-bold mb-2 leading-tight break-words pr-20 ${getTextColor(note.color)}`}>
                {note.title}
              </h2>

              <div className={`text-sm leading-snug whitespace-pre-wrap font-normal break-words break-all ${getTextColor(note.color)} opacity-90`}>
                {note.content}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}