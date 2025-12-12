import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Clock, Users } from "lucide-react";
import { EventData } from "@/lib/types";

interface EventItemProps {
  event: EventData;
  onEdit: (event: EventData) => void;
}

const EventItem = ({ event, onEdit }: EventItemProps) => {
  const formatDate = (date: Date | string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatus = (dateStr: Date | string) => {
    if (!dateStr) return "upcoming";
    const eventDateStr = new Date(dateStr).toISOString().split("T")[0];
    const todayStr = new Date().toISOString().split("T")[0];
    if (eventDateStr === todayStr) return "today";
    if (eventDateStr < todayStr) return "completed";
    return "upcoming";
  };

  const status = getStatus(event.date);
  const statusStyles: Record<string, string> = {
    upcoming: "bg-blue-50 text-blue-600 border-blue-100",
    today: "bg-green-50 text-green-600 border-green-100 animate-pulse",
    completed: "bg-gray-50 text-gray-500 border-gray-100",
  };

  return (
    <motion.div
      layoutId={`event-card-${event.id}`}
      className="p-3 sm:p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
      onClick={() => onEdit(event)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* HEADER ROW */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-3">
          <h3 className="font-bold text-gray-800 line-clamp-1 text-sm sm:text-base">
            {event.title}
          </h3>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {event.tags && event.tags.length > 0 ? (
              event.tags
                .filter((t) => t.toLowerCase() !== "upcoming")
                .map((tag, idx) => (
                  <span
                    key={`${tag}-${idx}`}
                    className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200"
                  >
                    {tag}
                  </span>
                ))
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-50 text-gray-400 border border-gray-100">
                No Tags
              </span>
            )}
          </div>
        </div>
        <span
          className={`shrink-0 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-full ${
            statusStyles[status] || statusStyles.upcoming
          }`}
        >
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
          <span className="truncate">{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          <span className="truncate">{event.location || "Online"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span className="truncate">
            {event.startTime || "--:--"} - {event.endTime || "End"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          <span className="truncate">{event.attendees || 0} Guest</span>
        </div>
      </div>
    </motion.div>
  );
};

export default EventItem;
