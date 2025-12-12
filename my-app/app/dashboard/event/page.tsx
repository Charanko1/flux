"use client";

import React, { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";

// --- Components Imports ---
// Pastikan path import ini sesuai dengan struktur foldermu
import CalendarWidget from "@/components/CalendarWidget";
import EventModal from "@/components/dashboard/event/EventModal";
import StatsSection from "@/components/dashboard/event/StatsSection";
import EventItem from "@/components/dashboard/event/EventItem";

// --- Refactored Components Imports ---
import ActivityItem from "@/components/dashboard/event/ActivityItem";
import EventHeader from "@/components/dashboard/event/EventHeader";
import EventControls from "@/components/dashboard/event/EventControls";
import MobileCalendarModal from "@/components/dashboard/event/MobileCalendarModal";
import { IconCalendarInternal } from "@/components/dashboard/event/EventIcons";

// IMPORT TIPE DATA SHARED
import { EventData, ActivityLog } from "@/lib/types";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 15
    }
  }
};

export default function EventPage() {
  // --- STATE ---
  const [events, setEvents] = useState<EventData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  // Modal & Animation State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isMobileCalendarOpen, setIsMobileCalendarOpen] = useState(false);
  const [layoutId, setLayoutId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. FETCH DATA DARI BACKEND SAAT LOAD
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoaded(true);
        const response = await fetch('/api/dashboard/event');
        if (response.ok) {
          const data = await response.json();
          // Normalisasi Data (MongoDB _id -> Frontend id)
          const formattedEvents = data.map((e: any) => ({
            ...e,
            id: e._id, // PENTING: Mapping _id ke id
            tags: e.tags || (e.category ? [e.category] : ["General"]),
          }));
          setEvents(formattedEvents);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoaded(false);
      }
    };

    fetchEvents();
  }, []);

  // Helper Status
  const getEventStatus = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventDate < today) return "completed";
    return "upcoming";
  };

  // Filtering Logic
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesStatus = true;
      const status = getEventStatus(event.date);
      
      if (filterStatus === "upcoming") matchesStatus = status === "upcoming";
      if (filterStatus === "completed") matchesStatus = status === "completed";
      
      return matchesSearch && matchesStatus;
    });
  }, [events, searchTerm, filterStatus]);

  // Logs Helper (Activity Log Lokal)
  const addActivity = (action: string, title: string) => {
    const newLog: ActivityLog = {
      id: Date.now(),
      action, 
      title,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setActivities(prev => [newLog, ...prev].slice(0, 5));
  };

  // 2. CRUD OPERATIONS (TERHUBUNG KE BACKEND)
  const handleSaveEvent = async (eventData: any) => {
    // Kita langsung kirim ke backend
    try {
      if (selectedEvent) {
        // --- UPDATE EXISTING EVENT (PUT) ---
        const response = await fetch('/api/dashboard/event', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedEvent.id, // Kirim ID lama untuk dicari di DB
            ...eventData
          }),
        });

        if (response.ok) {
          const updatedEvent = await response.json();
          // Update State Lokal biar gak perlu fetch ulang
          setEvents((prev) => prev.map((e) => (e.id === updatedEvent._id ? { ...updatedEvent, id: updatedEvent._id } : e)));
          addActivity("updated", updatedEvent.title);
        }
      } else {
        // --- CREATE NEW EVENT (POST) ---
        const response = await fetch('/api/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });

        if (response.ok) {
          const newEvent = await response.json();
          // Update State Lokal
          setEvents((prev) => [{ ...newEvent, id: newEvent._id }, ...prev]);
          addActivity("created", newEvent.title);
        }
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save event", error);
      alert("Gagal menyimpan event. Coba lagi.");
    }
  };

  const handleDeleteEvent = async (eventId: number | string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      // Kirim request DELETE ke backend dengan query param ?id=...
      const response = await fetch(`/api/event?id=${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const eventToDelete = events.find(e => e.id === eventId);
        // Hapus dari State Lokal
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        if (eventToDelete) addActivity("deleted", eventToDelete.title);
        closeModal();
      }
    } catch (error) {
      console.error("Failed to delete event", error);
      alert("Gagal menghapus event.");
    }
  };

  // --- MODAL HANDLERS ---
  const openModalForCreate = (sourceId: string) => {
    setLayoutId(sourceId);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (event: EventData) => {
    setLayoutId(`event-card-${event.id}`);
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setLayoutId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <motion.main 
        className="flex-1 p-3 md:p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* ITEM 1: HEADER */}
        <motion.div variants={itemVariants}>
            <EventHeader 
              onOpenMobileCalendar={() => setIsMobileCalendarOpen(true)}
              onOpenCreate={openModalForCreate}
            />
        </motion.div>

        {/* ITEM 2: STATS */}
        <motion.div variants={itemVariants}>
            <StatsSection events={events} />
        </motion.div>

        {/* ITEM 3: LAYOUT UTAMA (List & Sidebar) */}
        <motion.div 
            variants={itemVariants} 
            className="flex flex-col lg:flex-row mt-3 lg:mt-6 gap-3 lg:gap-6"
        >
          <div className="flex-1">
            
            {/* CONTROLS (SEARCH & FILTER) */}
            <EventControls 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onOpenCreate={openModalForCreate}
            />

            {/* EVENT LIST */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-3 sm:p-5 border-b border-gray-100">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                  {filterStatus === 'completed' ? 'Past Events' : 'Upcoming Events'}
                </h3>
              </div>
              <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
                {isLoaded ? (
                   <div className="text-center py-10 text-gray-400 animate-pulse">Loading events...</div>
                ) : filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <EventItem
                      key={event.id}
                      event={event}
                      onEdit={openModalForEdit}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">No events found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="w-full lg:w-80 flex flex-col gap-3 lg:gap-4 lg:mt-0">
            <div className="hidden lg:block">
              <CalendarWidget />
            </div>
            
            {/* RECENT ACTIVITY */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-800 mb-4 text-sm md:text-base">Recent Activity</h3>
                <div className="flex flex-col gap-1">
                    {activities.length > 0 ? (
                        activities.map(log => <ActivityItem key={log.id} action={log.action} title={log.title} time={log.time} />)
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <div className="p-3 bg-gray-50 rounded-full mb-2">
                                <IconCalendarInternal />
                            </div>
                            <p className="text-xs text-gray-400">No recent activity.</p>
                        </div>
                    )}
                </div>
            </div>
          </aside>
        </motion.div>
      </motion.main>

      {/* MODAL EVENT UTAMA */}
      <AnimatePresence>
        {isModalOpen && (
          <EventModal
            event={selectedEvent}
            onSave={handleSaveEvent}
            onClose={closeModal}
            onDelete={handleDeleteEvent}
            layoutId={layoutId}
          />
        )}
      </AnimatePresence>

      {/* MOBILE CALENDAR MODAL */}
      <AnimatePresence>
        {isMobileCalendarOpen && (
          <MobileCalendarModal 
            isOpen={isMobileCalendarOpen} 
            onClose={() => setIsMobileCalendarOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}