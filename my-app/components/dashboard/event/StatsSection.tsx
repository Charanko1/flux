// components/dashboard/event/StatsSection.jsx
import React from 'react';
import StatsCard from './StatsCard';
import { IconCalendar, IconClock, IconUsers, IconCheckCircle } from '@/components/icons';

const StatsSection = ({ events }) => {
  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length;
  const totalAttendees = events.reduce((sum, e) => sum + e.attendees, 0);
  const completedEvents = events.filter(e => new Date(e.date) < new Date()).length;

  return (
    // PERUBAHAN DI SINI:
    // 'grid-cols-2': Artinya default (mobile) langsung bagi 2 kolom.
    // 'lg:grid-cols-4': Artinya di layar besar (desktop) jadi 4 kolom.
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Events"
        value={events.length}
        icon={<IconCalendar className="text-blue-600" />}
        iconBg="bg-blue-100"
      />
      <StatsCard
        title="Upcoming Events"
        value={upcomingEvents}
        icon={<IconClock className="text-purple-600" />}
        iconBg="bg-purple-100"
      />
      <StatsCard
        title="Total Attendees"
        value={totalAttendees}
        icon={<IconUsers className="text-orange-600" />}
        iconBg="bg-orange-100"
      />
      <StatsCard
        title="Completed"
        value={completedEvents}
        icon={<IconCheckCircle className="text-green-600" />}
        iconBg="bg-green-100"
      />
    </div>
  );
};

export default StatsSection;