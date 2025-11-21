"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutGrid,
  CheckSquare,
  Calendar as CalendarIcon,
  Banknote,
  Settings,
  ChevronLeft,
  LogOut,
  X, // Menu icon sudah tidak dipakai disini
} from "lucide-react";
import MenuItem from "./MenuItem";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, loading, logout } = useAuth();

  // Auto-close on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsOpen]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleItemClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  if (loading) {
    return (
      <aside className="bg-white p-3 border-r border-gray-200 hidden md:flex flex-col gap-3 w-16 animate-pulse">
        <div className="w-8 h-8 bg-gray-200 rounded-lg mb-8"></div>
      </aside>
    );
  }

  return (
    <>
      {/* --- MOBILE OVERLAY (BACKDROP) --- */}
      <div
        className={`
          fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300
          ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}
        `}
        onClick={() => setIsOpen(false)}
      />

      {/* [DIHAPUS] 
          Bagian Mobile Hamburger Button yang tadinya ada disini sudah dihapus 
          karena fungsinya pindah ke Header.
      */}

      {/* --- SIDEBAR MAIN --- */}
      <aside
        className={`
          fixed md:relative top-0 left-0 h-full md:h-auto
          bg-white p-3 flex flex-col 
          transition-all duration-300 ease-in-out 
          z-50 border-r border-gray-200
          ${isOpen ? "w-64 md:w-56 translate-x-0" : "w-64 md:w-16 -translate-x-full md:translate-x-0"}
        `}
      >
        {/* Toggle Button Desktop */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            absolute -right-3 top-6 w-6 h-6 
            bg-white border border-gray-300 rounded-full 
            flex items-center justify-center text-gray-600 
            cursor-pointer hover:bg-gray-100 shadow-sm
            hidden md:flex
          `}
          style={{ transform: isOpen ? "rotate(0deg)" : "rotate(180deg)" }}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Tombol Close Mobile (Tetap dipertahankan buat nutup dari dalam sidebar) */}
        <div className="flex justify-end md:hidden mb-2">
          <button onClick={() => setIsOpen(false)} className="text-gray-500 p-1">
            <X size={20} />
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center mb-8 md:pt-3 h-12">
          <div className="relative flex-shrink-0">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || "User"
              )}&background=3b82f6&color=fff&size=64`}
              alt={user?.name || "User Avatar"}
              className="w-10 h-10 rounded-lg border-2 border-gray-100 shadow-sm object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

          <div
            className={`
              overflow-hidden transition-all duration-300 ease-out
              ${isOpen ? "w-40 ml-3 opacity-100" : "w-0 md:w-0 opacity-0"}
            `}
          >
            <p className="font-semibold text-sm truncate text-gray-900">
              {user?.name || "Guest"}
            </p>
            <p className="text-[10px] text-blue-700 font-medium bg-blue-100 px-2 py-0.5 rounded-full inline-block mt-1">
              {user?.role || "User Role"}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-6 overflow-y-auto scrollbar-hide">
          {/* Group 1 */}
          <div>
            <div
              className={`flex items-center gap-2 mb-2 transition-all duration-200 ease-in-out overflow-hidden ${
                isOpen ? "max-w-full opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                MAIN MENU
              </h2>
            </div>

            <ul className="space-y-2" onClick={handleItemClick}>
              <MenuItem
                icon={<LayoutGrid size={16} />}
                href="/dashboard"
                label="Dashboard"
                isOpen={isOpen}
              />
              <MenuItem
                icon={<CheckSquare size={16} />}
                href="/dashboard/task"
                label="Task"
                isOpen={isOpen}
              />
              <MenuItem
                icon={<CalendarIcon size={16} />}
                href="/dashboard/event"
                label="Event"
                isOpen={isOpen}
              />
              <MenuItem
                icon={<Banknote size={16} />}
                href="/dashboard/finance"
                label="Finance"
                isOpen={isOpen}
              />
            </ul>
          </div>

          {/* Group 2 */}
          <div>
            <div
              className={`flex items-center gap-2 mb-2 transition-all duration-200 ease-in-out overflow-hidden ${
                isOpen ? "max-w-full opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                OTHERS
              </h2>
            </div>

            <ul className="space-y-2" onClick={handleItemClick}>
              <MenuItem
                icon={<Settings size={16} />}
                href="/dashboard/settings"
                label="Settings"
                isOpen={isOpen}
              />
            </ul>
          </div>
        </nav>

        {/* Logout Section */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className={`
            group flex items-center gap-3 w-full p-2 rounded-lg
            transition-all duration-200
            ${isOpen ? "justify-start" : "justify-center"}
            text-red-500 hover:bg-red-50 hover:text-red-600
          `}
          >
            <LogOut size={16} className="flex-shrink-0" />

            <span
              className={`
              text-sm font-medium whitespace-nowrap 
              overflow-hidden transition-all duration-300
              ${isOpen ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0"}
            `}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;