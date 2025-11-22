"use client";

import React, { useState, useMemo } from "react";
import CalendarWidget from "@/components/CalendarWidget";
import EventModal from "@/components/dashboard/event/EventModal";
import StatsSection from "@/components/dashboard/event/StatsSection";
import EventItem from "@/components/dashboard/event/EventItem";
import { IconSearch, IconPlus } from "@/components/icons";
import { initialEvents } from "@/lib/data";

// --- ICONS ---
const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const IconClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// --- KOMPONEN ITEM HISTORY (LOG) VERSI MUNGIL ---
const ActivityItem = ({ action, title, time }) => {
  let icon, color, bg;

  switch (action) {
    case "created":
      icon = <IconPlus />; 
      color = "text-green-600";
      bg = "bg-green-100";
      break;
    case "updated":
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
      );
      color = "text-blue-600";
      bg = "bg-blue-100";
      break;
    case "deleted":
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      );
      color = "text-red-600";
      bg = "bg-red-100";
      break;
    default:
      icon = <IconCalendar />;
      color = "text-gray-600";
      bg = "bg-gray-100";
  }

  return (
    // UBAHAN: p-2 (lebih kecil), gap-2.5
    <div className="flex items-start gap-2.5 p-2 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
      {/* ICON CONTAINER: w-6 h-6 (Mungil) */}
      <div className={`flex-shrink-0 w-6 h-6 ${bg} ${color} rounded-full flex items-center justify-center mt-0.5`}>
        <div className="scale-75">{icon}</div>
      </div>
      <div className="min-w-0">
        {/* TEXT: text-xs (Kecil) */}
        <p className="text-xs text-gray-700 font-medium leading-snug truncate w-full">
          <span className="capitalize font-semibold">{action}</span> <span className="text-gray-500">event</span> "{title}"
        </p>
        {/* TIME: text-[10px] (Super kecil) */}
        <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{time}</p>
      </div>
    </div>
  );
};

export default function EventPage() {
  const [events, setEvents] = useState(initialEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activities, setActivities] = useState([]);

  // Modal Controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isMobileCalendarOpen, setIsMobileCalendarOpen] = useState(false);

  const getEventStatus = (dateStr) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventDate < today) return "completed";
    return "upcoming";
  };

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

  const addActivity = (action, title) => {
    const newLog = {
      id: Date.now(),
      action, 
      title,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setActivities(prev => [newLog, ...prev].slice(0, 5));
  };

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
    if (eventToDelete) {
        addActivity("deleted", eventToDelete.title);
    }
    closeModal();
  };

  const openModalForCreate = () => { setSelectedEvent(null); setIsModalOpen(true); };
  const openModalForEdit = (event) => { setSelectedEvent(event); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setSelectedEvent(null); };

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
            <button onClick={() => setIsMobileCalendarOpen(true)} className="flex items-center justify-center w-9 h-9 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"><IconCalendar /></button>
            <button onClick={openModalForCreate} className="flex items-center justify-center w-9 h-9 bg-gray-900 text-white rounded-lg shadow-sm hover:bg-gray-600 transition-colors"><IconPlus /></button>
          </div>
        </div>

        <StatsSection events={events} />

        <div className="flex flex-col lg:flex-row mt-3 lg:mt-6 gap-3 lg:gap-6">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2 sm:gap-3">
              <div className="flex flex-1 gap-2 w-full sm:max-w-lg">
                <div className="relative flex-1">
                  <input type="text" placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-700 shadow-sm" />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconSearch /></span>
                </div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 shadow-sm cursor-pointer hover:bg-gray-50">
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="hidden sm:flex w-auto">
                <button onClick={openModalForCreate} className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap"><IconPlus /><span>New Event</span></button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-3 sm:p-5 border-b border-gray-100">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                  {filterStatus === 'completed' ? 'Past Events' : 'Upcoming Events'}
                </h3>
              </div>
              <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => <EventItem key={event.id} event={event} onEdit={openModalForEdit} />)
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200"><p className="text-gray-500 text-sm">No events found.</p></div>
                )}
              </div>
            </div>
          </div>

          <aside className="w-full lg:w-80 flex flex-col gap-3 lg:gap-4 lg:mt-0">
            <div className="hidden lg:block"><CalendarWidget /></div>
            
            {/* SIDEBAR: RECENT ACTIVITY (VERSI MUNGIL) */}
            {/* UBAHAN: p-3 (lebih rapat) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">Recent Activity</h3>
                
                <div className="flex flex-col gap-1">
                    {activities.length > 0 ? (
                        activities.map(log => (
                            <ActivityItem key={log.id} action={log.action} title={log.title} time={log.time} />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-4 text-center">
                             <div className="p-2 bg-gray-50 rounded-full mb-1">
                                <div className="scale-75 text-gray-400"><IconCalendar /></div>
                             </div>
                             <p className="text-[10px] text-gray-400">No recent activity.</p>
                        </div>
                    )}
                </div>
            </div>
          </aside>
        </div>
      </main>

      {isModalOpen && <EventModal event={selectedEvent} onSave={handleSaveEvent} onClose={closeModal} onDelete={handleDeleteEvent} />}

      {isMobileCalendarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 lg:hidden backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-3 border-b">
              <h3 className="font-semibold text-gray-800 text-sm">Calendar</h3>
              <button onClick={() => setIsMobileCalendarOpen(false)} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"><IconClose /></button>
            </div>
            <div className="p-3"><CalendarWidget /></div>
          </div>
        </div>
      )}
    </div>
  );
}