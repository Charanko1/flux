"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
// Pastikan path import ini sesuai dengan project-mu
import { EventData } from "@/lib/types";

interface EventModalProps {
  event: EventData | null; // null jika mode "Add New"
  onSave: (data: any) => void;
  onClose: () => void;
  onDelete: (id: number | string) => void;
  layoutId: string | null;
}

export default function EventModal({ event, onSave, onClose, onDelete, layoutId }: EventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false); // State loading untuk tombol

  // State form menggunakan 'any' sementara untuk fleksibilitas tags (string vs array)
  const [formData, setFormData] = useState<any>({
      title: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      attendees: 0,
      tags: "",
      category: "General" 
  });

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        // Konversi array tags kembali ke string (dipisah koma) untuk diedit di input text
        tags: Array.isArray(event.tags) ? event.tags.join(", ") : event.tags,
        // Pastikan format tanggal YYYY-MM-DD agar input type="date" bisa membacanya
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : ""
      });
    } else {
      // Reset form jika mode Add New
      setFormData({
        title: "",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        attendees: 0,
        tags: "",
        category: "General"
      });
    }
  }, [event]);

  // Handle perubahan input text/number/select
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      // Jika input number, otomatis parse ke integer. Jika kosong, set 0.
      [name]: type === "number" ? (value ? parseInt(value, 10) : 0) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Proses Tags: Split koma, trim spasi, dan hapus yang kosong
    const processedTags = formData.tags.toString()
        .split(",")
        .map((t: string) => t.trim())
        .filter((t: string) => t !== "");

    // Siapkan data untuk dikirim ke Parent/Backend
    const submittedData = {
        ...formData,
        tags: processedTags,
        // Pastikan attendees dikirim sebagai number (bukan string)
        attendees: Number(formData.attendees), 
        // ID diurus oleh backend/parent component
    };

    await onSave(submittedData);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      {/* BACKDROP (Background Gelap) */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* MODAL CARD */}
      <motion.div 
        layoutId={layoutId || undefined}
        initial={!layoutId ? { opacity: 0, scale: 0.95 } : undefined}
        animate={!layoutId ? { opacity: 1, scale: 1 } : undefined}
        exit={!layoutId ? { opacity: 0, scale: 0.95 } : undefined}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto hide-scrollbar relative z-10"
      >
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {event ? "Edit Event" : "Add New Event"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <div>
            <label className="block text-sm text-gray-700 mb-1 font-medium">Event Title</label>
            <input
              type="text" name="title" required
              value={formData.title} onChange={handleChange}
              placeholder="Enter event title"
              className="w-full rounded-lg bg-gray-50 px-3 py-2 text-sm border border-gray-300 focus:ring-1 focus:ring-black focus:border-black outline-none transition"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm text-gray-700 mb-1 font-medium">Date</label>
            <input
              type="date" name="date" required
              value={formData.date} onChange={handleChange}
              className="w-full rounded-lg bg-gray-50 px-3 py-2 text-sm border border-gray-300 focus:ring-1 focus:ring-black outline-none transition"
            />
          </div>

          {/* Time (Start & End) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1 font-medium">Start Time</label>
              <input
                type="time" name="startTime" required
                value={formData.startTime} onChange={handleChange}
                className="w-full rounded-lg bg-gray-50 px-3 py-2 text-sm border border-gray-300 focus:ring-1 focus:ring-black outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1 font-medium">End Time</label>
              <input
                type="time" name="endTime" required
                value={formData.endTime} onChange={handleChange}
                className="w-full rounded-lg bg-gray-50 px-3 py-2 text-sm border border-gray-300 focus:ring-1 focus:ring-black outline-none transition"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm text-gray-700 mb-1 font-medium">Location</label>
            <input
              type="text" name="location"
              value={formData.location} onChange={handleChange}
              placeholder="e.g. Zoom Meeting, Office"
              className="w-full rounded-lg bg-gray-50 px-3 py-2 text-sm border border-gray-300 focus:ring-1 focus:ring-black outline-none transition"
            />
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm text-gray-700 mb-1 font-medium">Estimated Attendees</label>
            <input
              type="number" name="attendees" min="0"
              value={formData.attendees} onChange={handleChange}
              className="w-full rounded-lg bg-gray-50 px-3 py-2 text-sm border border-gray-300 focus:ring-1 focus:ring-black outline-none transition"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-gray-700 mb-1 font-medium">Tags (comma separated)</label>
            <input
              type="text" name="tags"
              value={formData.tags} onChange={handleChange}
              placeholder="Work, Important, Meeting"
              className="w-full rounded-lg bg-gray-50 px-3 py-2 text-sm border border-gray-300 focus:ring-1 focus:ring-black outline-none transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-black hover:bg-gray-800 text-white py-2.5 rounded-lg transition text-sm font-medium shadow-sm active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isSubmitting && <Loader2 className="animate-spin w-4 h-4" />}
              {event ? "Save Changes" : "Add Event"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition text-sm font-medium disabled:opacity-70"
            >
              Cancel
            </button>
          </div>

          {/* Delete Button (Only Show on Edit) */}
          {event && (
            <button
              type="button"
              onClick={() => onDelete(event.id)}
              disabled={isSubmitting}
              className="w-full mt-1 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition font-medium disabled:opacity-70"
            >
              Delete Event
            </button>
          )}
        </form>
      </motion.div>
    </div>
  );
}