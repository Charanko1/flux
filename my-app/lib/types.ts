// Definisi EventData yang lengkap (Superset)
export interface EventData {
  id: number | string;
  title: string;
  date: string;
  category: string;
  description: string;
  location: string;
  tags: string[]; 
  startTime?: string;
  endTime?: string;
  attendees?: number | string;
}

export interface ActivityLog {
  id: number;
  action: string;
  title: string;
  time: string;
}