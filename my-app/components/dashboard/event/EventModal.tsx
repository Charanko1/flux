"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion"; // Import Motion

export default function EventModal({ event, onSave, onClose, onDelete, layoutId }) {
  const [formData, setFormData] = useState(
    event || {
      title: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      attendees: 0,
      tags: "",
    }
  );

  useEffect(() => {
    if (event) {
      setFormData(event);
    } else {
      setFormData({
        title: "",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        attendees: 0,
        tags: ""
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value, 10) : value
    }));
  };

  // Logic unik punya abang (Tags dipisah koma)
  const handleTagChange = (e) => {
    // Simpan sebagai string di state lokal biar enak diedit di input
    // Nanti pas submit baru di-split kalau perlu, atau biarkan logic parent yang handle
    // Tapi karena di props onSave abang kirim object utuh, kita sesuaikan di sini:
    setFormData((prev) => ({
      ...prev,
      tags: e.target.value // Simpan string dulu agar input text aman
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pas save, konversi tags string ke array (kalau backend butuh array)
    // Atau kirim string kalau logic parent abang handle string.
    // Di sini saya asumsikan parent handle array seperti kode sebelumnya:
    const submittedData = {
        ...formData,
        tags: Array.isArray(formData.tags) ? formData.tags : formData.tags.split(",").map(t => t.trim()),
        id: event ? event.id : crypto.randomUUID()
    };
    onSave(submittedData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      {/* BACKDROP (Fade In) */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* MODAL CARD (MORPHING) */}
      {/* Kita pake style punya abang: rounded-xl, max-h-[90vh], dll */}
      <motion.div 
        layoutId={layoutId} // Kunci animasi magic motion
        initial={!layoutId ? { opacity: 0, scale: 0.9 } : undefined}
        animate={!layoutId ? { opacity: 1, scale: 1 } : undefined}
        exit={!layoutId ? { opacity: 0, scale: 0.9 } : undefined}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="bg-white rounded-xl w-full max-w-lg p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto hide-scrollbar relative z-10"
      >
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {event ? "Edit Event" : "Add New Event"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
            <X size={20} className="sm:w-[22px] sm:h-[22px]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

          {/* Title */}
          <div>
            <label className="block text-xs sm:text-sm text-gray-700 mb-1 font-medium">Event Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              className="w-full rounded-lg bg-[#F5F6FA] px-3 py-2 text-sm text-gray-900 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900"
              // AutoFocus dimatikan biar animasi di HP smooth
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs sm:text-sm text-gray-700 mb-1 font-medium">Date</label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="w-full rounded-lg bg-[#F5F6FA] px-3 py-2 text-sm text-gray-900 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          {/* Start & End Time */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm text-gray-700 mb-1 font-medium">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full rounded-lg bg-[#F5F6FA] px-3 py-2 text-sm text-gray-900 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-700 mb-1 font-medium">End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full rounded-lg bg-[#F5F6FA] px-3 py-2 text-sm text-gray-900 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs sm:text-sm text-gray-700 mb-1 font-medium">Location</label>
            <input
              type="text"
              name="location"
              placeholder="Enter location"
              value={formData.location}
              onChange={handleChange}
              className="w-full rounded-lg bg-[#F5F6FA] px-3 py-2 text-sm text-gray-900 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-xs sm:text-sm text-gray-700 mb-1 font-medium">Number of Attendees</label>
            <input
              type="number"
              name="attendees"
              min="0"
              value={formData.attendees}
              onChange={handleChange}
              className="w-full rounded-lg bg-[#F5F6FA] px-3 py-2 text-sm text-gray-900 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs sm:text-sm text-gray-700 mb-1 font-medium">Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              value={Array.isArray(formData.tags) ? formData.tags.join(", ") : formData.tags}
              onChange={handleTagChange}
              placeholder="e.g. Work, Meeting, Important"
              className="w-full rounded-lg bg-[#F5F6FA] px-3 py-2 text-sm text-gray-900 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2 sm:pt-4">
            <button
              type="submit"
              className="flex-1 bg-[#0B122A] hover:bg-[#030712] text-white py-2 sm:py-2.5 rounded-lg transition text-sm sm:text-base font-medium shadow-sm active:scale-95"
            >
              {event ? "Save Changes" : "Add Event"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-400 text-gray-700 py-2 sm:py-2.5 rounded-lg hover:bg-gray-100 transition text-sm sm:text-base font-medium"
            >
              Cancel
            </button>
          </div>

          {event && (
            <button
              type="button"
              onClick={() => onDelete(event.id)}
              className="w-full mt-1 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition font-medium"
            >
              Delete Event
            </button>
          )}
        </form>
      </motion.div>
    </div>
  );
}