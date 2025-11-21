"use client";
import React from "react";
import Link from "next/link";

interface MenuItemProps {
  icon: React.ReactNode;
  href?: string;
  label: string;
  isOpen: boolean;
  active?: boolean;
  count?: number;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  href,
  label,
  isOpen,
  active = false,
  count,
}) => {
  const base =
    "flex items-center w-full p-3 rounded-xl transition-all duration-200 group";

  const activeStyle = active
    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border-l-4 border-blue-400 shadow-lg"
    : "text-gray-600 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:text-white hover:border-l-4 hover:border-blue-400 hover:shadow-lg";

  return (
    <li>
      <Link href={href || "#"} className={`${base} ${activeStyle}`}>
        
        {/* ICON – selalu stabil */}
        <div
          className={`flex-shrink-0 transition-colors ${
            active ? "text-blue-400" : "text-gray-400 group-hover:text-white"
          }`}
        >
          {icon}
        </div>

        {/* TEXT WRAPPER — FIX UTAMA */}
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-out
            ${isOpen ? "w-32 ml-3 opacity-100" : "w-0 opacity-0"}
          `}
        >
          <span className="font-medium whitespace-nowrap">{label}</span>

          {count !== undefined && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full ml-2">
              {count}
            </span>
          )}
        </div>
      </Link>
    </li>
  );
};

export default MenuItem;
