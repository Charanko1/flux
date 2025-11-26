"use client";

import React from "react";
import Link from "next/link";
import { FiTrash2, FiArrowLeft } from "react-icons/fi";

// 1. Definisikan Tipe Data Note
interface Note {
  id: string | number;
  title: string;
  content: string;
  date: string;
  color: string; // Properti color wajib ada karena dipakai di getTextColor
}

// 2. Definisikan Props Komponen
interface NoteDetailViewProps {
  note: Note | null; // Note bisa null jika belum dimuat
  onDelete: (id: string | number) => void;
}

// 3. Pasang Interface di sini
export default function NoteDetailView({ note, onDelete }: NoteDetailViewProps) {
  // Fungsi helper untuk warna text berdasarkan background
  const getTextColor = (bgColor: string) => {
    return ["#1F2937", "#111827"].includes(bgColor)
      ? "text-white"
      : "text-gray-800";
  };

  if (!note) return null;

  return (
    <div className="max-w-5xl mx-auto w-full">
      {/* Tombol Back */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/notes"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
        >
          <FiArrowLeft size={20} />
          <span>Back to Notes</span>
        </Link>
      </div>

      {/* KARTU DETAIL */}
      <div 
        className={`border border-gray-200 rounded-xl p-8 min-h-[600px] relative shadow-sm transition-colors duration-300`}
        style={{ backgroundColor: note.color || "#FFFFFF" }} 
      >
        {/* Header Kartu: Judul & Delete */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className={`text-3xl font-medium mb-2 capitalize ${getTextColor(note.color)}`}>
              {note.title}
            </h1>
            <p className={`text-sm opacity-60 ${getTextColor(note.color)}`}>
              Created: {note.date}
            </p>
          </div>

          {/* Tombol Delete */}
          <button
            onClick={() => onDelete(note.id)}
            className={`p-2 rounded-lg transition-all opacity-70 hover:opacity-100 ${getTextColor(note.color)}`}
            aria-label="Delete note"
          >
            <FiTrash2 size={24} />
          </button>
        </div>

        {/* Isi Catatan */}
        <div className={`text-lg leading-relaxed whitespace-pre-wrap font-normal ${getTextColor(note.color)}`}>
          {note.content}
        </div>
      </div>
    </div>
  );
}