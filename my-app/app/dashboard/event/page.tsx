// app/events/page.jsx
"use client";

import React, { useState, useMemo } from "react";
import CalendarWidget from "@/components/CalendarWidget";
import RecentActivity from "@/components/dashboard/event/RecentActivity";
import EventModal from "@/components/dashboard/event/EventModal";
import StatsSection from "@/components/dashboard/event/StatsSection";
import EventItem from "@/components/dashboard/event/EventItem";
import { IconSearch, IconPlus } from "@/components/icons";
import { initialEvents } from "@/lib/data";

const IconCalendar = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const IconClose = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function EventPage() {
  const [events, setEvents] = useState(initialEvents);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal Controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isMobileCalendarOpen, setIsMobileCalendarOpen] = useState(false);

  // Memoized Filtering
  const filteredEvents = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return events.filter((event) =>
      event.title.toLowerCase().includes(term)
    );
  }, [events, searchTerm]);

  // CRUD Save
  const handleSaveEvent = (eventData) => {
    const exists = events.find((e) => e.id === eventData.id);
    if (exists) {
      setEvents((prev) =>
        prev.map((e) => (e.id === eventData.id ? eventData : e))
      );
    } else {
      setEvents((prev) => [eventData, ...prev]);
    }
    closeModal();
  };

  // CRUD Delete
  const handleDeleteEvent = (eventId) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    closeModal();
  };

  const openModalForCreate = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };
  const openModalForEdit = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <main className="flex-1 p-4 lg:p-6">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Events Dashboard</h2>
            <p className="text-sm text-gray-500">
              Manage and track all your events
            </p>
          </div>

          <div className="flex gap-2 sm:hidden">
            <button
              onClick={() => setIsMobileCalendarOpen(true)}
              className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              <IconCalendar />
            </button>
            <button
              onClick={openModalForCreate}
              className="flex items-center justify-center w-10 h-10 bg-gray-900 text-white rounded-lg shadow-sm hover:bg-gray-600 transition-colors"
            >
              <IconPlus />
            </button>
          </div>
        </div>

        {/* Stats */}
        <StatsSection events={events} />

        {/* Layout Utama: Flex Column di Mobile, Row di Desktop */}
        {/* PERBAIKAN DI SINI: gap-3 untuk mobile, gap-6 untuk desktop */}
        <div className="flex flex-col lg:flex-row mt-6 gap-3 lg:gap-6">
          
          {/* Left Column */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-0">
              <div className="relative w-full sm:max-w-sm">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-700"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <IconSearch />
                </span>
              </div>
              <div className="hidden sm:flex w-full sm:w-auto justify-end space-x-2">
                <button
                  onClick={openModalForCreate}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <IconPlus />
                  <span>New Event</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                  Upcoming Events
                </h3>
              </div>
              <div className="p-4 sm:p-5 space-y-4">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <EventItem
                      key={event.id}
                      event={event}
                      onEdit={openModalForEdit}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No events found matching your search.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          {/* PERBAIKAN DI SINI: hapus mt-4 */}
          <aside className="w-full lg:w-80 flex flex-col gap-4 lg:mt-0">
            <div className="hidden lg:block">
              <CalendarWidget />
            </div>
            <RecentActivity />
          </aside>
        </div>
      </main>

      {/* Modals... (Sama seperti sebelumnya) */}
      {isModalOpen && (
        <EventModal
          event={selectedEvent}
          onSave={handleSaveEvent}
          onClose={closeModal}
          onDelete={handleDeleteEvent}
        />
      )}

      {isMobileCalendarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 lg:hidden backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-gray-800">Calendar</h3>
              <button 
                onClick={() => setIsMobileCalendarOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <IconClose />
              </button>
            </div>
            <div className="p-4">
              <CalendarWidget />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}