"use client";
import React, { useState, useEffect, useRef } from "react";
import { FiCheck, FiSearch } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion"; // Pastikan import ini ada

// Import Components
import NoteModal from "@/components/dashboard/notes/NoteModal";
import NoteDetailModal from "@/components/dashboard/notes/NoteDetailModal";
import { Note } from "../../../components/dashboard/notes/types"; 
import { NotesHeader, NoteCard, SkeletonCard } from "@/components/dashboard/notes/NoteComponents"; 

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  
  const [createLayoutId, setCreateLayoutId] = useState<string | null>(null); 
  const [detailLayoutId, setDetailLayoutId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [showNotification, setShowNotification] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. FETCH NOTES
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dashboard/notes');
        if (response.ok) {
          const data = await response.json();
          const formattedNotes = data.map((n: any) => ({
            ...n,
            id: n._id
          }));
          setNotes(formattedNotes);
        }
      } catch (error) {
        console.error("Failed to fetch notes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) || 
      note.content.toLowerCase().includes(query)
    );
  });

  // 2. CREATE NOTE
  const handleSaveNote = async (newNoteData: any) => {
    try {
      const response = await fetch('/api/dashboard/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNoteData),
      });

      if (response.ok) {
        const createdNote = await response.json();
        // Tambahkan ID baru ke state
        setNotes((prev) => [{ ...createdNote, id: createdNote._id }, ...prev]);
        triggerNotification();
        closeCreateModal();
      }
    } catch (error) {
      console.error("Failed to create note:", error);
      alert("Gagal membuat catatan.");
    }
  };

  // 3. UPDATE NOTE
  const handleUpdateNote = async (updatedNote: Note) => {
    try {
      const newNotes = notes.map((n) => (n.id === updatedNote.id ? updatedNote : n));
      setNotes(newNotes);
      setSelectedNote(updatedNote); 

      await fetch('/api/dashboard/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNote),
      });
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };

  const triggerNotification = () => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setShowNotification(true);
    setTimeout(() => setIsVisible(true), 10);
    notificationTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setShowNotification(false), 500); 
    }, 3000); 
  };

  // 4. DELETE NOTE
  const handleDelete = async (id: string | number) => {
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        // Optimistic Update: Hapus dari UI langsung biar animasi jalan
        const updatedNotes = notes.filter((note) => note.id !== id);
        setNotes(updatedNotes);
        
        setDetailModalOpen(false);
        setSelectedNote(null);

        await fetch(`/api/dashboard/notes?id=${id}`, { method: 'DELETE' });
      } catch (error) {
        console.error("Failed to delete note:", error);
      }
    }
  };

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
      
      <NotesHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCreate={openCreateModal}
        isCreateModalOpen={isCreateModalOpen}
      />

      <div className="px-8 pb-8 w-full max-w-7xl mx-auto">
        
        {/* Notification Toast */}
        <div className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${showNotification ? 'max-h-40 mb-6' : 'max-h-0 mb-0'}`}>
          <div className={`w-full bg-amber-100 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-sm transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}`}>
            <div className="mt-0.5 text-amber-600 bg-white/50 p-1 rounded-full">
              <FiCheck size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">Note successfully saved!</h3>
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
            <p>No results found for <strong>"{searchQuery}"</strong></p>
            <button onClick={() => setSearchQuery("")} className="text-amber-600 hover:underline mt-2 text-sm">
              Clear search
            </button>
          </div>
        ) : (
          // UPDATE ANIMASI: Bungkus dengan motion.div dan AnimatePresence
          <motion.div 
            layout 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredNotes.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                >
                  <NoteCard 
                    note={note} 
                    onClick={openDetail} 
                    onDelete={handleDelete} 
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

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