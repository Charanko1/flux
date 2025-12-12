"use client";
import React, { useState, useEffect, useRef } from "react";
import { FiCheck, FiSearch } from "react-icons/fi";
import { AnimatePresence } from "framer-motion";

// Import Components
import NoteModal from "@/components/dashboard/notes/NoteModal";
import NoteDetailModal from "@/components/dashboard/notes/NoteDetailModal";
import { Note } from "../../../components/dashboard/notes/types"; // Sesuaikan path
import { NotesHeader, NoteCard, SkeletonCard } from "@/components/dashboard/notes/NoteComponents"; // Sesuaikan path

export default function NotesPage() {
  // SOLUSI ERROR: Tambahkan <Note[]> biar TypeScript tau ini array Note
  const [notes, setNotes] = useState<Note[]>([]); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  
  // State ID Animasi
  const [createLayoutId, setCreateLayoutId] = useState<string | null>(null); 
  const [detailLayoutId, setDetailLayoutId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  // --- LOGIC NOTIFIKASI ---
  const [showNotification, setShowNotification] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadNotes = () => {
      // Casting ke Note[] agar aman
      const savedNotes = JSON.parse(localStorage.getItem("notes") || "[]") as Note[];
      setNotes(savedNotes);
      setIsLoading(false);
    };
    loadNotes();
  }, []);

  // Filter Logic (Sekarang aman karena TypeScript tau note punya title)
  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) || 
      note.content.toLowerCase().includes(query)
    );
  });

  const handleSaveNote = (newNote: any) => { // Bisa ganti 'any' ke tipe khusus create note kalau mau
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
    triggerNotification();
    closeCreateModal();
  };

  const handleUpdateNote = (updatedNote: Note) => {
    const newNotes = notes.map((n) => (n.id === updatedNote.id ? updatedNote : n));
    setNotes(newNotes);
    localStorage.setItem("notes", JSON.stringify(newNotes));
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

  const handleDelete = (id: string | number) => {
    if (confirm("Yakin mau hapus catatan ini?")) {
      const updatedNotes = notes.filter((note) => note.id !== id);
      setNotes(updatedNotes);
      localStorage.setItem("notes", JSON.stringify(updatedNotes));
      setDetailModalOpen(false);
      setSelectedNote(null);
    }
  };

  // FUNGSI MODAL
  const openDetail = (note: Note) => {
    setDetailLayoutId(`note-card-${note.id}`);
    setSelectedNote(note);
    setDetailModalOpen(true);
  };

  const closeDetail = () => {
    setDetailModalOpen(false);
    setTimeout(() => setDetailLayoutId(null), 300);
  };

  const openCreateModal = () => {
    setCreateLayoutId("btn-add-note");
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setTimeout(() => setCreateLayoutId(null), 300);
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen relative">
      
      {/* HEADER Component */}
      <NotesHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCreate={openCreateModal}
        isCreateModalOpen={isCreateModalOpen}
      />

      {/* Main Content */}
      <div className="px-8 pb-8 w-full max-w-7xl mx-auto">
        
        {/* Notification Toast */}
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

        {/* LIST CATATAN */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center text-gray-500 mt-24 animate-in fade-in duration-500">
            <p>No records yet.</p>
            <p>Click “Add Note” to create a new note.</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center text-gray-500 mt-24 animate-in fade-in duration-500">
             <div className="inline-block p-3 bg-gray-100 rounded-full mb-3">
                <FiSearch size={24} className="text-gray-400" />
             </div>
            <p>No results found.<strong>"{searchQuery}"</strong></p>
            <button onClick={() => setSearchQuery("")} className="text-amber-600 hover:underline mt-2 text-sm">
              Bersihkan pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredNotes.map((note) => (
              <NoteCard 
                key={note.id} 
                note={note} 
                onClick={openDetail} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <NoteModal 
            isOpen={isCreateModalOpen} 
            onClose={closeCreateModal} 
            onSave={handleSaveNote}
            layoutId={createLayoutId} 
          />
        )}
      </AnimatePresence>
      
      {/* DETAIL MODAL */}
      <AnimatePresence>
        {isDetailModalOpen && selectedNote && (
          <NoteDetailModal 
            note={selectedNote}
            onClose={closeDetail}
            onDelete={handleDelete}
            onUpdate={handleUpdateNote}
            layoutId={detailLayoutId} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}