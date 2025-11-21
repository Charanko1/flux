"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiTrash2, FiCheck, FiSearch } from "react-icons/fi";
import NoteModal from "@/components/dashboard/notes/NoteModal";
import NoteDetailModal from "@/components/dashboard/notes/NoteDetailModal";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  // --- LOGIC NOTIFIKASI ---
  const [showNotification, setShowNotification] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const notificationTimeoutRef = useRef(null);

  useEffect(() => {
    const loadNotes = () => {
      const savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
      setNotes(savedNotes);
      setIsLoading(false);
    };
    loadNotes();
  }, []);

  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) || 
      note.content.toLowerCase().includes(query)
    );
  });

  const handleSaveNote = (newNote) => {
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
    triggerNotification();
  };

  // --- LOGIC UPDATE NOTE ---
  const handleUpdateNote = (updatedNote) => {
    const newNotes = notes.map((n) => (n.id === updatedNote.id ? updatedNote : n));
    setNotes(newNotes);
    localStorage.setItem("notes", JSON.stringify(newNotes));
    
    // Update note yang lagi dibuka biar langsung berubah tampilannya
    setSelectedNote(updatedNote); 
  };

  const triggerNotification = () => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setShowNotification(true);
    setTimeout(() => {
      setIsVisible(true);
    }, 10);
    notificationTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setShowNotification(false);
      }, 500); 
    }, 3000); 
  };

  const handleDelete = (id) => {
    if (confirm("Yakin mau hapus catatan ini?")) {
      const updatedNotes = notes.filter((note) => note.id !== id);
      setNotes(updatedNotes);
      localStorage.setItem("notes", JSON.stringify(updatedNotes));
      setDetailModalOpen(false);
      setSelectedNote(null);
    }
  };

  const openDetail = (note) => {
    setSelectedNote(note);
    setDetailModalOpen(true);
  };

  const getTextColor = (bgColor) => {
    return ["#1F2937", "#111827"].includes(bgColor) ? "text-white" : "text-gray-800";
  };

  const SkeletonCard = () => (
    <div className="rounded-xl p-3 border border-gray-200 bg-white h-32 flex flex-col animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="space-y-2 flex-1">
        <div className="h-2 bg-gray-100 rounded"></div>
        <div className="h-2 bg-gray-100 rounded w-5/6"></div>
      </div>
      <div className="h-2 bg-gray-100 rounded w-1/4 mt-2"></div>
    </div>
  );

  return (
    <div className="w-full bg-gray-50 min-h-screen relative">
      
      {/* Header */}
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

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-amber-300 hover:bg-amber-400 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-transform active:scale-95 whitespace-nowrap"
          >
            <span className="text-lg font-semibold">+</span> <span className="hidden sm:inline">Add Note</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 pb-8 w-full max-w-7xl mx-auto">
        
        <div className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${showNotification ? 'max-h-40 mb-6' : 'max-h-0 mb-0'}`}>
          <div className={`w-full bg-amber-100 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-sm transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}`}>
            <div className="mt-0.5 text-amber-600 bg-white/50 p-1 rounded-full">
              <FiCheck size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">Note successfully added!</h3>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center text-gray-500 mt-24 animate-in fade-in duration-500">
            <p>Belum ada catatan.</p>
            <p>Klik "Add Note" untuk membuat catatan baru.</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center text-gray-500 mt-24 animate-in fade-in duration-500">
             <div className="inline-block p-3 bg-gray-100 rounded-full mb-3">
                <FiSearch size={24} className="text-gray-400" />
             </div>
            <p>Tidak ditemukan catatan dengan kata kunci <strong>"{searchQuery}"</strong></p>
            <button onClick={() => setSearchQuery("")} className="text-amber-600 hover:underline mt-2 text-sm">
              Bersihkan pencarian
            </button>
          </div>
        ) : (
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredNotes.map((note) => (
              <div 
                key={note.id} 
                onClick={() => openDetail(note)}
                className="group cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <div
                  className={`rounded-xl p-3 shadow-sm hover:shadow-md border relative h-32 flex flex-col
                              transition-all ${getTextColor(note.color)}`}
                  style={{
                    backgroundColor: note.color,
                    borderColor: note.color === "#F5F5F5" ? "#E0E0E0" : "transparent",
                  }}
                >
                  {/* Judul */}
                  <h2 className={`font-bold text-sm mb-1 tracking-tight line-clamp-1 ${getTextColor(note.color)}`}>
                    {note.title}
                  </h2>
                  
                  {/* Konten: flex-1 DIHAPUS, ditambah overflow-hidden */}
                  <p className={`text-xs whitespace-pre-line leading-snug line-clamp-3 break-all overflow-hidden ${getTextColor(note.color)} opacity-85`}>
                    {note.content}
                  </p>
                  
                  {/* Spacer Baru: Buat dorong tanggal ke bawah */}
                  <div className="flex-1"></div>

                  {/* Tanggal */}
                  <p className={`text-[10px] mt-2 ${getTextColor(note.color)} opacity-60`}>
                    {note.date}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(note.id);
                    }}
                    className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-black/10 ${
                      getTextColor(note.color) === "text-white" ? "text-white hover:text-red-300" : "text-red-500 hover:text-red-700"
                    }`}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <NoteModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
        onSave={handleSaveNote} 
      />
      
      {/* Modal Detail + Edit */}
      <NoteDetailModal 
        isOpen={isDetailModalOpen}
        note={selectedNote}
        onClose={() => setDetailModalOpen(false)}
        onDelete={handleDelete}
        onUpdate={handleUpdateNote} 
      />
    </div>
  );
}