import React from 'react';
import { motion } from "framer-motion"; // Import motion
import { IconCalendar, IconMapPin, IconClock, IconUsers } from '@/components/icons';
import { formatDate } from '@/lib/date';
import { getTagColor } from '@/lib/ui';

const EventItem = ({ event, onEdit }) => {
  
  // Logic Status
  const getStatus = (dateStr) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventDate < today) return "completed";
    if (eventDate.getTime() === today.getTime()) return "today";
    return "upcoming";
  };

  const status = getStatus(event.date);

  const statusStyles = {
    upcoming: "bg-blue-50 text-blue-600 border-blue-100",
    today: "bg-green-50 text-green-600 border-green-100 animate-pulse",
    completed: "bg-gray-50 text-gray-500 border-gray-100",
  };

  return (
    <motion.div 
      // UBAHAN: Pake layoutId biar bisa morphing
      layoutId={`event-card-${event.id}`}
      className="p-2.5 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onEdit(event)}
      // Animasi masuk
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      {/* HEADER ROW */}
      <div className="flex justify-between items-start mb-1.5 sm:mb-3">
        <div className="flex-1 pr-2 sm:pr-3">
          <h3 className="font-semibold text-gray-800 line-clamp-1 text-sm sm:text-base">
            {event.title}
          </h3>
          <div className="flex flex-wrap gap-1 mt-0.5 sm:mt-1">
            {event.tags
              .filter(t => t.toLowerCase() !== 'upcoming') 
              .map(tag => (
              <span key={tag} className={`px-1.5 py-0.5 text-[9px] sm:text-[10px] sm:px-2 font-medium rounded-full ${getTagColor(tag)}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <span className={`shrink-0 px-1.5 py-0.5 sm:px-2.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border rounded-full ${statusStyles[status]}`}>
          {status}
        </span>
      </div>

      {/* BODY ROW */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 sm:gap-x-4 sm:gap-y-3 text-[11px] sm:text-sm text-gray-600">
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <IconCalendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <IconMapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <IconClock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">
            {event.startTime || "--:--"} - {event.endTime || "End"}
          </span>
        </div>
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <IconUsers className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{event.attendees || 0} Guest</span>
        </div>
      </div>
    </motion.div>
  );
};

export default EventItem;