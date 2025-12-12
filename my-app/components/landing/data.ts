// components/landing/data.ts
import { Variants } from "framer-motion";

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export const featuresList = [
  { title: "Task", desc: "Organize and prioritize your tasks effortlessly.", icon: '✓' },
  { title: "Event", desc: "Schedule and manage your events visually.", icon: '📅' },
  { title: "Finance", desc: "Track your expenses and manage budget.", icon: '💹' },
  { title: "Notes", desc: "Capture your thoughts and ideas instantly.", icon: '📝' },
];