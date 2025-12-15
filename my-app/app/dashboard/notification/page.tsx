"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaCheck, 
  FaInfo, 
  FaExclamation, 
  FaTimes, 
  FaBell 
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  isRead: boolean;
  createdAt: string;
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Notifikasi
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/dashboard/notification");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark All as Read
  const markAllRead = async () => {
    await fetch("/api/dashboard/notification", { method: "PUT" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  useEffect(() => {
    fetchNotifications();
    const timer = setTimeout(() => {
      markAllRead();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Style Mewah per Tipe
  const getStyle = (type: string) => {
    switch (type) {
      case "success": 
        return { 
          gradient: "from-emerald-400 to-teal-500", 
          shadow: "shadow-emerald-500/20",
          icon: <FaCheck className="text-white drop-shadow-sm" size={12} /> 
        };
      case "warning": 
        return { 
          gradient: "from-amber-400 to-orange-500", 
          shadow: "shadow-amber-500/20",
          icon: <FaExclamation className="text-white drop-shadow-sm" size={12} /> 
        };
      case "error":   
        return { 
          gradient: "from-rose-400 to-red-600", 
          shadow: "shadow-rose-500/20",
          icon: <FaTimes className="text-white drop-shadow-sm" size={12} /> 
        };
      default:        
        return { 
          gradient: "from-blue-400 to-indigo-600", 
          shadow: "shadow-blue-500/20",
          icon: <FaInfo className="text-white drop-shadow-sm" size={12} /> 
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-3 md:p-10 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Compact */}
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <div>
            <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              Notifications
              <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
                {notifications.some(n => !n.isRead) && (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3 bg-amber-500"></span>
                  </>
                )}
              </span>
            </h1>
            <p className="text-gray-500 text-xs md:text-sm mt-1 font-medium">
              Your recent updates.
            </p>
          </div>
          
          <div className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-100 text-[10px] md:text-xs font-semibold text-gray-600">
            <HiSparkles className="text-amber-500" />
            <span>Flux</span>
          </div>
        </div>

        {/* Content List */}
        {loading ? (
           <div className="space-y-3">
             {[1, 2, 3].map((i) => (
               <div key={i} className="h-16 md:h-24 bg-white rounded-2xl shadow-sm animate-pulse border border-gray-100" />
             ))}
           </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="bg-gray-50 p-4 rounded-full mb-3">
                <FaBell className="text-gray-300 text-xl" />
            </div>
            <p className="text-gray-400 text-xs md:text-sm font-medium">No new updates.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {notifications.map((notif, index) => {
                const style = getStyle(notif.type);
                return (
                  <motion.div
                    key={notif._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    // Card Container: Lebih kecil paddingnya di Mobile (p-3)
                    className={`
                      group relative overflow-hidden rounded-2xl md:rounded-[1.5rem] border bg-white p-3 md:p-6
                      transition-all duration-300 hover:shadow-lg
                      ${!notif.isRead 
                        ? "border-amber-200/60 shadow-md shadow-amber-500/5 bg-white" 
                        : "border-gray-100 shadow-sm bg-gray-50/30"
                      }
                    `}
                  >
                    <div className="flex gap-3 md:gap-5 items-start relative z-10">
                      
                      {/* Icon: Lebih kecil di mobile (w-9 h-9) */}
                      <div className={`
                        flex-shrink-0 w-9 h-9 md:w-14 md:h-14 
                        flex items-center justify-center 
                        rounded-xl md:rounded-2xl bg-gradient-to-br ${style.gradient} ${style.shadow}
                      `}>
                        {/* Ukuran icon di dalam kotak menyesuaikan (size=12 di mobile) */}
                        <div className="scale-90 md:scale-125">
                            {style.icon}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex justify-between items-start gap-2">
                          {/* Title: Text size disesuaikan */}
                          <h3 className={`text-xs md:text-lg font-bold leading-tight ${!notif.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notif.title}
                          </h3>
                          
                          {/* Date: Lebih kecil */}
                          <span className="text-[9px] md:text-[11px] font-semibold text-gray-400 whitespace-nowrap pt-0.5">
                            {formatDate(notif.createdAt)}
                          </span>
                        </div>
                        
                        {/* Message: Text size disesuaikan */}
                        <p className={`text-[10px] md:text-sm mt-1 leading-relaxed line-clamp-2 md:line-clamp-none ${!notif.isRead ? 'text-gray-600' : 'text-gray-400'}`}>
                          {notif.message}
                        </p>
                      </div>

                      {/* Dot Indicator untuk Unread */}
                      {!notif.isRead && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 md:right-0 md:top-1/2 md:relative md:translate-y-0 flex">
                           <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-amber-500"></span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}