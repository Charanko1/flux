"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NoteDetailView from "@/components/dashboard/notes/NoteDetailView"; 

// --- 1. UPDATE DEFINISI TIPE DATA ---
// Tambahkan 'color' agar sesuai dengan yang diminta NoteDetailView
interface Note {
  id: string | number;
  title: string;
  content: string;
  category: string;
  priority: string;
  date: string;
  color: string; // Wajib ada sekarang
}

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  // Ambil data saat halaman dimuat
  useEffect(() => {
    const rawData = JSON.parse(localStorage.getItem("notes") || "[]");
    
    // --- 2. NORMALISASI DATA ---
    // Kita map data mentah ke tipe Note yang benar.
    // Jika data lama belum punya 'color', kita kasih default "#ffffff"
    const savedNotes: Note[] = rawData.map((n: any) => ({
      ...n,
      color: n.color || "#ffffff", 
      category: n.category || "General",
      priority: n.priority || "Low"
    }));
    
    const foundNote = savedNotes.find((n) => String(n.id) === String(params.id));
    
    setNote(foundNote || null);
    setLoading(false);
  }, [params.id]);

  // Fungsi Hapus Note
  const handleDelete = (id: string | number) => {
    if (confirm("Yakin mau hapus catatan ini?")) {
      const rawData = JSON.parse(localStorage.getItem("notes") || "[]");
      // Filter dari data mentah agar aman
      const updatedNotes = rawData.filter((n: any) => String(n.id) !== String(id));
      
      localStorage.setItem("notes", JSON.stringify(updatedNotes));
      router.push("/dashboard/notes"); 
    }
  };

  // State Loading
  if (loading) {
    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="text-gray-500 animate-pulse">Loading note...</div>
        </div>
    );
  }

  // State Jika Tidak Ketemu
  if (!note) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50 p-6">
        <p className="text-gray-500 mb-4 font-medium">Catatan tidak ditemukan.</p>
        <button 
          onClick={() => router.push("/dashboard/notes")}
          className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all"
        >
          &larr; Kembali ke daftar
        </button>
      </div>
    );
  }

  // Render Komponen View
  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen w-full">
      {/* Tombol Back di Mobile */}
      <div className="mb-4 md:hidden">
         <button 
          onClick={() => router.push("/dashboard/notes")}
          className="text-gray-500 hover:text-gray-900 text-sm flex items-center gap-1"
        >
          &larr; Back
        </button>
      </div>

      {/* Error hilang karena objek 'note' sekarang punya properti 'color' */}
      <NoteDetailView note={note} onDelete={handleDelete} />
    </div>
  );
}