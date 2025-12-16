"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { EventData } from "@/lib/types";

interface EventModalProps {
  event: EventData | null;
  onSave: (data: any) => void;
  onClose: () => void;
  onDelete: (id: number | string) => void;
  layoutId?: string | null;
}

export default function EventModal({
  event,
  onSave,
  onClose,
  onDelete,
  layoutId,
}: EventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<any>({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    attendees: 0,
    tags: "",
    category: "General",
  });

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        tags: Array.isArray(event.tags) ? event.tags.join(", ") : event.tags,
        date: event.date
          ? new Date(event.date).toISOString().split("T")[0]
          : "",
      });
    } else {
      setFormData({
        title: "",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        attendees: 0,
        tags: "",
        category: "General",
      });
    }
  }, [event]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "number" ? (value ? parseInt(value, 10) : 0) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const processedTags = formData.tags
      .toString()
      .split(",")
      .map((t: string) => t.trim())
      .filter((t: string) => t !== "");

    const submittedData = {
      ...formData,
      tags: processedTags,
      attendees: Number(formData.attendees),
    };

    await onSave(submittedData);
    setIsSubmitting(false);
  };

  const inputClassName =
    "w-full rounded-lg bg-white px-3 py-2.5 text-sm font-medium text-black border border-gray-300 shadow-sm placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all antialiased";

  const labelClassName =
    "block text-sm text-black mb-1.5 font-bold tracking-wide antialiased";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 antialiased">
      {/* BACKDROP - Fade In/Out Sederhana */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm will-change-opacity"
      />

      {/* MODAL CONTAINER - Menggunakan LayoutId untuk Morphing */}
      <motion.div
        layoutId={layoutId || "new-event-card"}
        className="bg-white rounded-xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] border border-gray-200"
        // Transisi yang lebih smooth (Apple-like physics)
        transition={{
          type: "spring",
          stiffness: 350, // Sedikit lebih kencang
          damping: 35,    // Meredam pantulan agar smooth
          mass: 1
        }}
      >
        {/* CONTENT WRAPPER - Fade In dengan Delay agar tidak "Melar" */}
        <motion.div
          className="p-6 overflow-y-auto hide-scrollbar h-full bg-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }} // Saat tutup konten hilang duluan
          transition={{ duration: 0.3, delay: 0.15 }} // Delay sedikit biar box membesar dulu
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-extrabold text-black tracking-tight">
              {event ? "Edit Event" : "Add New Event"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClassName}>Event Title</label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Project Launching"
                value={formData.title}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>

            <div>
              <label className={labelClassName}>Date</label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClassName}>Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  required
                  value={formData.startTime}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}>End Time</label>
                <input
                  type="time"
                  name="endTime"
                  required
                  value={formData.endTime}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <label className={labelClassName}>Location</label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Meeting Room A / Zoom"
                value={formData.location}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>

            <div>
              <label className={labelClassName}>Attendees</label>
              <input
                type="number"
                name="attendees"
                min="0"
                value={formData.attendees}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>

            <div>
              <label className={labelClassName}>
                Tags{" "}
                <span className="text-gray-400 font-normal text-xs">
                  (comma separated)
                </span>
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Work, Meeting, Important"
                className={inputClassName}
              />
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-gray-100 mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-black hover:bg-gray-800 text-white py-2.5 rounded-lg transition-all text-sm font-bold shadow-md flex justify-center items-center gap-2 active:scale-[0.98]"
              >
                {isSubmitting && <Loader2 className="animate-spin w-4 h-4" />}
                {event ? "Save Changes" : "Add Event"}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 bg-white border border-gray-300 text-black py-2.5 rounded-lg hover:bg-gray-50 transition-all text-sm font-bold shadow-sm active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>

            {event && (
              <button
                type="button"
                onClick={() => onDelete(event.id)}
                disabled={isSubmitting}
                className="w-full py-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition font-bold"
              >
                Delete Event
              </button>
            )}
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}