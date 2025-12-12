import React from 'react';
import StatsCard from './StatsCard';
// Gunakan Lucide icons biar seragam (atau icon kamu sebelumnya)
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react'; 
import { EventData } from '@/lib/types';

interface StatsSectionProps {
  events: EventData[];
}

const StatsSection = ({ events }: StatsSectionProps) => {
  const today = new Date();
  today.setHours(0,0,0,0);

  // Filter Event Upcoming (Termasuk Hari Ini)
  const upcomingEvents = events.filter(e => {
     const eDate = new Date(e.date);
     return eDate >= today;
  }).length;
  
  // Total Attendees (Aman dari null/undefined)
  const totalAttendees = events.reduce((sum, e) => sum + (Number(e.attendees) || 0), 0);
  
  // Filter Completed
  const completedEvents = events.filter(e => {
     const eDate = new Date(e.date);
     return eDate < today;
  }).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      <StatsCard
        title="Total Events"
        value={events.length}
        icon={<Calendar className="text-blue-600" />}
        iconBg="bg-blue-100"
      />
      <StatsCard
        title="Upcoming"
        value={upcomingEvents}
        icon={<Clock className="text-purple-600" />}
        iconBg="bg-purple-100"
      />
      <StatsCard
        title="Total Attendees"
        value={totalAttendees}
        icon={<Users className="text-orange-600" />}
        iconBg="bg-orange-100"
      />
      <StatsCard
        title="Completed"
        value={completedEvents}
        icon={<CheckCircle className="text-green-600" />}
        iconBg="bg-green-100"
      />
    </div>
  );
};

export default StatsSection;