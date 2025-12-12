"use client";

import React, { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";

import CalendarWidget from "@/components/CalendarWidget";
import EventModal from "@/components/dashboard/event/EventModal";
import StatsSection from "@/components/dashboard/event/StatsSection";
import EventItem from "@/components/dashboard/event/EventItem";
import ActivityItem from "@/components/dashboard/event/ActivityItem";
import EventHeader from "@/components/dashboard/event/EventHeader";
import EventControls from "@/components/dashboard/event/EventControls";
import MobileCalendarModal from "@/components/dashboard/event/MobileCalendarModal";
import { IconCalendarInternal } from "@/components/dashboard/event/EventIcons";
import { EventData, ActivityLog } from "@/lib/types";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 15 } }
};

export default function EventPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isMobileCalendarOpen, setIsMobileCalendarOpen] = useState(false);
  
  // PENTING: layoutId state
  const [layoutId, setLayoutId] = useState<string | null>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoaded(true);
        const response = await fetch('/api/dashboard/event', { cache: 'no-store' }); 
        if (response.ok) {
          const data = await response.json();
          const formattedEvents = data.map((e: any) => ({
            ...e,
            id: e._id, 
            tags: e.tags || (e.category ? [e.category] : ["General"]),
          }));
          setEvents(formattedEvents);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoaded(false);
      }
    };
    fetchEvents();
  }, []);

  // ... (Helper getEventStatus, filteredEvents, addActivity SAMA SEPERTI SEBELUMNYA) ...
  const getEventStatus = (dateStr: string) => {
    const eventDate = new Date(dateStr).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
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

  const addActivity = (action: string, title: string) => {
    const newLog: ActivityLog = {
      id: Date.now(),
      action, title,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setActivities(prev => [newLog, ...prev].slice(0, 5));
  };

  // ... (handleSaveEvent & handleDeleteEvent SAMA SEPERTI SEBELUMNYA) ...
  const handleSaveEvent = async (eventData: any) => {
    try {
      if (selectedEvent) {
        const response = await fetch('/api/dashboard/event', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedEvent.id, ...eventData }),
        });
        if (response.ok) {
          const updatedEvent = await response.json();
          setEvents((prev) => prev.map((e) => (e.id === updatedEvent._id ? { ...updatedEvent, id: updatedEvent._id } : e)));
          addActivity("updated", updatedEvent.title);
        }
      } else {
        const response = await fetch('/api/dashboard/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
        if (response.ok) {
          const newEvent = await response.json();
          setEvents((prev) => [{ ...newEvent, id: newEvent._id }, ...prev]);
          addActivity("created", newEvent.title);
        }
      }
      closeModal();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteEvent = async (eventId: number | string) => {
    if (!confirm("Delete this event?")) return;
    try {
      const response = await fetch(`/api/dashboard/event?id=${eventId}`, { method: 'DELETE' });
      if (response.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        addActivity("deleted", "Event");
        closeModal();
      }
    } catch (error) { console.error(error); }
  };

  // --- HANDLER MODAL (PENTING) ---
  const openModalForCreate = (sourceId: string) => {
    setLayoutId(sourceId); // Set ID untuk animasi start
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (event: EventData) => {
    setLayoutId(`event-card-${event.id}`); // Set ID unik kartu
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Kita TIDAK meng-null-kan layoutId di sini agar animasi exit tau harus pulang ke mana
    // setSelectedEvent(null); // Bisa di-delay atau biarkan, modal handle reset via useEffect
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <motion.main className="flex-1 p-3 md:p-6" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}><EventHeader onOpenMobileCalendar={() => setIsMobileCalendarOpen(true)} onOpenCreate={openModalForCreate} /></motion.div>
        <motion.div variants={itemVariants}><StatsSection events={events} /></motion.div>
        
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row mt-3 lg:mt-6 gap-3 lg:gap-6">
          <div className="flex-1">
            <EventControls searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterStatus={filterStatus} setFilterStatus={setFilterStatus} onOpenCreate={openModalForCreate} />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-3 sm:p-5 border-b border-gray-100">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">{filterStatus === 'completed' ? 'Past Events' : 'Upcoming Events'}</h3>
              </div>
              <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
                {isLoaded ? <div className="text-center py-10 text-gray-400">Loading...</div> : 
                 filteredEvents.length > 0 ? filteredEvents.map((event) => (
                    <EventItem 
                      key={event.id} 
                      event={event} 
                      onEdit={openModalForEdit} 
                      // EventItem akan otomatis pakai ID ini untuk layoutId
                    />
                  )) : <div className="text-center py-8 text-sm text-gray-500">No events found.</div>}
              </div>
            </div>
          </div>
          <aside className="w-full lg:w-80 flex flex-col gap-3 lg:gap-4 lg:mt-0">
            <div className="hidden lg:block"><CalendarWidget /></div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-800 mb-4 text-sm md:text-base">Recent Activity</h3>
                <div className="flex flex-col gap-1">
                    {activities.map(log => <ActivityItem key={log.id} action={log.action} title={log.title} time={log.time} />)}
                </div>
            </div>
          </aside>
        </motion.div>
      </motion.main>

      <AnimatePresence>
        {isModalOpen && (
          <EventModal
            event={selectedEvent}
            onSave={handleSaveEvent}
            onClose={closeModal}
            onDelete={handleDeleteEvent}
            layoutId={layoutId} // Kirim ID ke modal
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{isMobileCalendarOpen && <MobileCalendarModal isOpen={isMobileCalendarOpen} onClose={() => setIsMobileCalendarOpen(false)} />}</AnimatePresence>
    </div>
  );
}