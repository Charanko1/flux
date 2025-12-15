"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Menu } from "lucide-react";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  notificationHref?: string;
}

const Header = ({ 
  title, 
  onMenuClick, 
  notificationHref = "/dashboard/notification" // Sesuaikan dengan path page notif kamu
}: HeaderProps) => {
  const [hasUnread, setHasUnread] = useState(false);

  // Fungsi Cek Notifikasi ke Backend
  const checkUnread = async () => {
    try {
      const res = await fetch("/api/dashboard/notification");
      if (res.ok) {
        const data = await res.json();
        // Cek apakah ada setidaknya satu notifikasi yang isRead == false
        const unreadExists = data.some((n: any) => n.isRead === false);
        setHasUnread(unreadExists);
      }
    } catch (error) {
      console.error("Gagal cek notifikasi di header", error);
    }
  };

  useEffect(() => {
    checkUnread();

    // Opsional: Cek ulang setiap 10 detik biar realtime kalau ada notif baru masuk pas user lagi diem
    const interval = setInterval(checkUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white sticky top-0 z-10 shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center px-4 py-3 md:px-6 md:py-4">
        {/* KIRI */}
        <div className="flex items-center gap-3 overflow-hidden max-w-[70%]">
          <button
            onClick={onMenuClick}
            className="md:hidden text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu size={24} />
          </button>

          <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
            {title}
          </h1>
        </div>

        {/* KANAN */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link href={notificationHref} onClick={() => setHasUnread(false)}>
            <button
              className="relative text-gray-500 hover:text-gray-700 p-1.5 md:p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="Notifikasi"
            >
              <Bell className="w-5 h-5 md:w-6 md:h-6" />
              
              {/* 🔴 Logika Titik Merah: Hanya muncul jika hasUnread == true */}
              {hasUnread && (
                <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;