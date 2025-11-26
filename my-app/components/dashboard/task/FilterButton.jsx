import React from "react";

export default function FilterButton({ label, active, setActive }) {
  const isActive = active === label;
  let activeStyle = "bg-gray-800 border-gray-800 text-white"; 
  
  if (label === "High") activeStyle = "bg-[#EF4444] border-[#EF4444] text-white"; 
  else if (label === "Medium") activeStyle = "bg-[#FACC15] border-[#FACC15] text-white"; 
  else if (label === "Low") activeStyle = "bg-[#22C55E] border-[#22C55E] text-white"; 

  return (
    <button
      onClick={() => setActive(label)}
      className={`px-3 py-1 rounded-md border text-xs whitespace-nowrap transition-all font-medium ${
        isActive ? activeStyle + " shadow-sm transform scale-105" : "bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}