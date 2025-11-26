import React from "react";
import { IconPlus } from "@/components/icons"; // Pastikan path ini sesuai
import { IconCalendarInternal, IconCloseInternal } from "./EventIcons";

// 1. Definisikan tipe data props-nya
interface ActivityItemProps {
  action: string;
  title: string;
  time: string;
}

// 2. Pasang Interface-nya di sini
export default function ActivityItem({ action, title, time }: ActivityItemProps) {
  let icon, color, bg;
  
  switch (action) {
    case "created": 
      icon = <IconPlus />; 
      color = "text-green-600"; 
      bg = "bg-green-100"; 
      break;
    case "updated": 
      icon = <IconCalendarInternal />; 
      color = "text-blue-600"; 
      bg = "bg-blue-100"; 
      break;
    case "deleted": 
      icon = <IconCloseInternal />; 
      color = "text-red-600"; 
      bg = "bg-red-100"; 
      break;
    default: 
      icon = <IconCalendarInternal />; 
      color = "text-gray-600"; 
      bg = "bg-gray-100";
  }
  
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
      <div className={`flex-shrink-0 w-8 h-8 ${bg} ${color} rounded-full flex items-center justify-center mt-0.5`}>
        <div className="scale-75">{icon}</div>
      </div>
      <div>
        <p className="text-sm text-gray-800 font-medium leading-snug">
          <span className="capitalize">{action}</span> event <span className="font-bold">"{title}"</span>
        </p>
        <p className="text-[10px] text-gray-400 mt-1 font-medium">{time}</p>
      </div>
    </div>
  );
}