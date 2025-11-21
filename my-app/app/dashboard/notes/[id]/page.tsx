"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NoteDetailView from "@/components/dashboard/notes/NoteDetailView"; // 👈 Import komponen yg kita buat tadi

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Ambil data saat halaman dimuat
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
    
    // Cari note yang ID-nya sama dengan params.id
    // Pastikan tipe datanya sama (biasanya di URL string, di JSON number/string)
    const foundNote = savedNotes.find((n) => String(n.id) === String(params.id));
    
    setNote(foundNote);
    setLoading(false);
  }, [params.id]);

  // 2. Fungsi Hapus Note
  const handleDelete = (id) => {
    if (confirm("Yakin mau hapus catatan ini?")) {
      const savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
      const updatedNotes = savedNotes.filter((n) => n.id !== id);
      
      localStorage.setItem("notes", JSON.stringify(updatedNotes));
      router.push("/dashboard/notes"); // Balik ke halaman list setelah hapus
    }
  };

  // State Loading
  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading note...</div>;
  }

  // State Jika Tidak Ketemu
  if (!note) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-500 mb-4">Catatan tidak ditemukan.</p>
        <button 
          onClick={() => router.push("/dashboard/notes")}
          className="text-blue-500 hover:underline"
        >
          Kembali ke daftar
        </button>
      </div>
    );
  }

  // Render Komponen View
  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen w-full">
      <NoteDetailView note={note} onDelete={handleDelete} />
    </div>
  );
}