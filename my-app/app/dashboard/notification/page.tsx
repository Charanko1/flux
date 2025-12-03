"use client";

import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Bell, 
  Check, 
  Trash2, 
  MoreVertical,
  DollarSign,
  Settings
} from 'lucide-react';

// --- TIPE DATA ---
type NotificationType = 'message' | 'task' | 'warning' | 'info' | 'payment';

interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  isUnread: boolean;
  avatar?: string;
}

// --- DATA DUMMY ---
const initialData: NotificationItem[] = [
  {
    id: 1,
    type: 'message',
    title: 'New Message from Sarah',
    description: 'Hey! Have you seen the document I sent yesterday?',
    time: '5 min ago',
    isUnread: true,
    avatar: 'https://i.pravatar.cc/150?u=sarah', 
  },
  {
    id: 2,
    type: 'task',
    title: 'Task Completed',
    description: 'Project "Website Redesign" has been successfully completed!',
    time: '30 min ago',
    isUnread: true,
  },
  {
    id: 3,
    type: 'warning',
    title: 'Deadline Approaching',
    description: 'Task "Monthly Report" will expire in 2 days.',
    time: '2 hr ago',
    isUnread: true,
  },
  {
    id: 4,
    type: 'info',
    title: 'System Update',
    description: 'System will be updated on November 30, 2025 at 02:00 AM.',
    time: '5 hr ago',
    isUnread: false,
  },
  {
    id: 5,
    type: 'payment',
    title: 'Payment Received',
    description: 'Payment for invoice #INV-2025-001 of $5,000 has been received.',
    time: '3 days ago',
    isUnread: false,
  },
];

export default function NotificationPage() {
  const [notifications, setNotifications] = useState(initialData);
  const [filter, setFilter] = useState('all');

  // Filter Logic
  const filteredNotifications = notifications.filter(item => {
    if (filter === 'unread') return item.isUnread;
    return true;
  });

  const unreadCount = notifications.filter(n => n.isUnread).length;

  // Actions
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isUnread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Helper Icon
  // FIX: Menambahkan tipe data eksplisit (NotificationType dan string)
  const renderIcon = (type: NotificationType, avatar?: string) => {
    if (type === 'message' && avatar) {
      return <img src={avatar} alt="User" className="w-10 h-10 rounded-full object-cover border border-gray-200" />;
    }
    
    const baseClass = "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0";
    const iconSize = 20;
    
    switch (type) {
      case 'task': return <div className={`${baseClass} bg-gray-900 text-yellow-500`}><CheckCircle size={iconSize} /></div>;
      case 'warning': return <div className={`${baseClass} bg-orange-100 text-orange-600`}><AlertTriangle size={iconSize} /></div>;
      case 'info': return <div className={`${baseClass} bg-gray-100 text-gray-600`}><Info size={iconSize} /></div>;
      case 'payment': return <div className={`${baseClass} bg-gray-900 text-yellow-500`}><DollarSign size={iconSize} /></div>;
      default: return <div className={`${baseClass} bg-blue-100 text-blue-600`}><Bell size={iconSize} /></div>;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* --- CONTROL BAR (Filter & Actions) --- */}
      <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        {/* Tabs */}
        <div className="flex bg-gray-50 p-1 rounded-lg w-full sm:w-auto">
          <button 
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${
              filter === 'all' 
                ? 'bg-orange-300 text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All ({notifications.length})
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${
              filter === 'unread' 
                ? 'bg-orange-300 text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button 
            onClick={markAllAsRead}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-all"
          >
            <Check size={16} /> <span className="hidden sm:inline">Mark All as Read</span>
          </button>
          <button 
            onClick={clearAll}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg border border-transparent hover:border-red-100 transition-all"
          >
            <Trash2 size={16} /> <span className="hidden sm:inline">Clear All</span>
          </button>
        </div>
      </div>

      {/* --- NOTIFICATION LIST --- */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
            <Bell className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No notifications found.</p>
            <p className="text-sm text-gray-400">We'll let you know when something arrives.</p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div 
              key={item.id} 
              className={`group relative bg-white p-4 rounded-xl border transition-all hover:shadow-md flex gap-4 items-start ${
                item.isUnread 
                  ? 'border-orange-200 bg-orange-50/30' 
                  : 'border-gray-100'
              }`}
            >
              {/* Icon */}
              {renderIcon(item.type, item.avatar)}

              {/* Text Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex justify-between items-start">
                  <h3 className={`text-sm font-semibold truncate ${item.isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                    {item.title}
                  </h3>
                  {item.isUnread && (
                    <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1.5 ml-2"></span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
                <p className="text-xs text-gray-400 mt-2 font-medium">
                  {item.time}
                </p>
              </div>

              {/* Action Dot */}
              <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity p-1">
                <MoreVertical size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}