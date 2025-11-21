// components/dashboard/event/EventItem.jsx
import React from 'react';
import { IconCalendar, IconMapPin, IconClock, IconUsers } from '@/components/icons';
// LIHAT INI: Import di-update ke file baru
import { formatDate } from '@/lib/date';
import { getTagColor } from '@/lib/ui';

const EventItem = ({ event, onEdit }) => (
  <div 
    className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
    onClick={() => onEdit(event)}
  >
    <div className="flex justify-between items-center mb-3">
      <h3 className="font-semibold text-gray-800">{event.title}</h3>
      <div className="flex space-x-2">
        {event.tags.map(tag => (
          <span
            key={tag}
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTagColor(tag)}`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
      <div className="flex items-center space-x-2">
        <IconCalendar className="w-4 h-4 text-gray-400" />
        {/* Fungsi formatDate sekarang diimpor dari lib/date.js */}
        <span>{formatDate(event.date)}</span>
      </div>
      <div className="flex items-center space-x-2">
        <IconMapPin className="w-4 h-4 text-gray-400" />
        <span>{event.location}</span>
      </div>
      {/* ... sisa kode ... */}
    </div>
  </div>
);

export default EventItem;