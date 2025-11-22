"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Import Framer Motion
import CalendarWidget from "@/components/CalendarWidget";
import EventModal from "@/components/dashboard/event/EventModal";
import StatsSection from "@/components/dashboard/event/StatsSection";
import EventItem from "@/components/dashboard/event/EventItem";
import { IconSearch, IconPlus, IconCalendar, IconClose } from "@/components/icons";
import { initialEvents } from "@/lib/data";

// --- ICONS INTERNAL ---
const IconCalendarInternal = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const IconCloseInternal = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

// --- ACTIVITY ITEM ---
const ActivityItem = ({ action, title, time }) => {
  let icon, color, bg;
  switch (action) {
    case "created": icon = <IconPlus />; color = "text-green-600"; bg = "bg-green-100"; break;
    case "updated": icon = <IconCalendarInternal />; color = "text-blue-600"; bg = "bg-blue-100"; break;
    case "deleted": icon = <IconCloseInternal />; color = "text-red-600"; bg = "bg-red-100"; break;
    default: icon = <IconCalendarInternal />; color = "text-gray-600"; bg = "bg-gray-100";
  }
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
      <div className={`flex-shrink-0 w-8 h-8 ${bg} ${color} rounded-full flex items-center justify-center mt-0.5`}>
        <div className="scale-75">{icon}</div>
      </div>
      <div>
        <p className="text-sm text-gray-800 font-medium leading-snug">
          <span className="capitalize">{action}</span> event <span className="font-bold">"{title}"</span>
        </p>
        <p className="text-[10px] text-gray-400 mt-1 font-medium">{time}</p>
      </div>
    </div>
  );
};

export default function EventPage() {
  const [events, setEvents] = useState(initialEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activities, setActivities] = useState([]);

  // Modal & Animation State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isMobileCalendarOpen, setIsMobileCalendarOpen] = useState(false);
  const [layoutId, setLayoutId] = useState(null); // ID Animasi Magic Motion

  // Helper Status
  const getEventStatus = (dateStr) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventDate < today) return "completed";
    return "upcoming";
  };

  // Filtering
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

  // Logs
  const addActivity = (action, title) => {
    const newLog = {
      id: Date.now(),
      action, title,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setActivities(prev => [newLog, ...prev].slice(0, 5));
  };

  // CRUD
  const handleSaveEvent = (eventData) => {
    const exists = events.find((e) => e.id === eventData.id);
    if (exists) {
      setEvents((prev) => prev.map((e) => (e.id === eventData.id ? eventData : e)));
      addActivity("updated", eventData.title);
    } else {
      setEvents((prev) => [eventData, ...prev]);
      addActivity("created", eventData.title);
    }
    closeModal();
  };

  const handleDeleteEvent = (eventId) => {
    const eventToDelete = events.find(e => e.id === eventId);
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    if (eventToDelete) addActivity("deleted", eventToDelete.title);
    closeModal();
  };

  // --- MODAL HANDLERS ---
  const openModalForCreate = (sourceId) => {
    setLayoutId(sourceId);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (event) => {
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
      <main className="flex-1 p-3 md:p-6">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Events Dashboard</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">Manage and track all your events</p>
          </div>

          <div className="flex gap-2 sm:hidden">
            {/* TOMBOL KALENDER (ANIMASI MORPH) */}
            <motion.button
              layoutId="btn-calendar-mobile" // ID unik untuk morphing
              onClick={() => setIsMobileCalendarOpen(true)}
              className="flex items-center justify-center w-9 h-9 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <IconCalendarInternal />
            </motion.button>
            
            {/* TOMBOL ADD (ANIMASI MORPH) */}
            <motion.button
              layoutId="fab-add-event"
              onClick={() => openModalForCreate("fab-add-event")}
              className="flex items-center justify-center w-9 h-9 bg-gray-900 text-white rounded-lg shadow-sm hover:bg-gray-800 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <IconPlus />
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <StatsSection events={events} />

        {/* Layout Utama */}
        <div className="flex flex-col lg:flex-row mt-3 lg:mt-6 gap-3 lg:gap-6">
          <div className="flex-1">
            
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2 sm:gap-3">
              <div className="flex flex-1 gap-2 w-full sm:max-w-lg">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-700 shadow-sm"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <IconSearch />
                  </span>
                </div>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 shadow-sm cursor-pointer hover:bg-gray-50"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              {/* TOMBOL ADD DESKTOP (ANIMASI) */}
              <div className="hidden sm:flex w-auto">
                <motion.button
                  layoutId="btn-add-event"
                  onClick={() => openModalForCreate("btn-add-event")}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap"
                  whileTap={{ scale: 0.95 }}
                >
                  <IconPlus />
                  <span>New Event</span>
                </motion.button>
              </div>
            </div>

            {/* Event List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-3 sm:p-5 border-b border-gray-100">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                  {filterStatus === 'completed' ? 'Past Events' : 'Upcoming Events'}
                </h3>
              </div>
              <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <EventItem
                      key={event.id}
                      event={event}
                      onEdit={openModalForEdit} // Pass fungsi edit
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

          {/* Right Sidebar */}
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
        </div>
      </main>

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

      {/* --- MOBILE CALENDAR MODAL (FIXED BLUR EXIT) --- */}
      <AnimatePresence>
        {isMobileCalendarOpen && (
          // Wrapper: Hapus style visual (bg/blur) dari sini biar pas exit gak nyangkut
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:hidden">
            
            {/* Backdrop: Pindah bg-black dan blur ke sini + tambah transition exit */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }} // Exit cepat (200ms)
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsMobileCalendarOpen(false)}
            />

            {/* Modal Content dengan Morphing */}
            <motion.div 
              layoutId="btn-calendar-mobile"
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden relative z-10"
            >
              <div className="flex justify-between items-center p-3 border-b">
                <h3 className="font-semibold text-gray-800 text-sm">Calendar</h3>
                <button 
                  onClick={() => setIsMobileCalendarOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <IconCloseInternal />
                </button>
              </div>
              <div className="p-3">
                <CalendarWidget />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}