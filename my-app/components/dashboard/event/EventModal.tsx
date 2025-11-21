"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function EventModal({ event, onSave, onClose, onDelete }) {
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

  const handleTagChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      tags: e.target.value.split(",").map((tag) => tag.trim())
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, id: event ? event.id : crypto.randomUUID() });
  };

  return (
    // UBAH 1: Tambah 'p-4' di wrapper luar supaya modal gak nempel pinggir layar HP
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      
      {/* UBAH 2: 
          - 'w-full max-w-lg': Lebar full di HP, tapi dibatasi max-w-lg di desktop
          - 'p-4 sm:p-6': Padding dalam lebih tipis di HP (mungil), lebar di desktop
          - 'max-h-[90vh] overflow-y-auto': Supaya bisa discroll kalau layar HP pendek
      */}
      <div className="bg-white rounded-xl w-full max-w-lg p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto hide-scrollbar">
        
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
        {/* UBAH 3: space-y-3 di HP biar lebih compact, space-y-4 di desktop */}
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
              placeholder="upcoming, Meeting, Work"
              value={formData.tags}
              onChange={handleTagChange}
              className="w-full rounded-lg bg-[#F5F6FA] px-3 py-2 text-sm text-gray-900 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2 sm:pt-4">
            <button
              type="submit"
              className="flex-1 bg-[#0B122A] hover:bg-[#030712] text-white py-2 sm:py-2.5 rounded-lg transition text-sm sm:text-base font-medium"
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
              className="w-full mt-1 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
            >
              Delete Event
            </button>
          )}
        </form>
      </div>
    </div>
  );
}