"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const getPageTitle = () => {
    const currentPath = pathname?.split('/').pop();
    if (!currentPath || currentPath === 'dashboard') return 'Dashboard';
    return currentPath.charAt(0).toUpperCase() + currentPath.slice(1);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col">
        <Header title={getPageTitle()} onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Satu-satunya scrollable area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
