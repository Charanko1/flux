// components/LoginAssets.tsx
import { Loader2 } from "lucide-react";
import { Variants } from "framer-motion";

// --- ANIMATION VARIANTS ---
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

export const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 100 } 
  },
};

// --- COMPONENTS ---
export const Spinner = () => (
  <div className="flex items-center justify-center">
    <Loader2 className="animate-spin h-4 w-4 border-gray-700 mr-2" />
    <span className="text-xs text-gray-700">Loading...</span>
  </div>
);

export const FluxBackground = () => (
  <div className="absolute inset-0 grid grid-cols-6 pointer-events-none select-none h-full">
    <div className="bg-gradient-to-b from-[#FFCB74] to-[#E6AE47]" />
    <div className="bg-gradient-to-b from-[#F6F6F6] to-[#CFA348]" />
    <div className="bg-gradient-to-b from-[#2F2F2F] to-[#2F2F2F]" />
    <div className="bg-gradient-to-b from-[#FFCB74] to-[#5C5C5C]" />
    <div className="bg-gradient-to-b from-[#111111] to-[#F0D28C]" />
    <div className="bg-gradient-to-b from-[#F6F6F6] to-[#B0A48C]" />
  </div>
);