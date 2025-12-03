import Link from 'next/link';
import { Bell, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

const Header = ({ title, onMenuClick }: HeaderProps) => (
  <header className="bg-white sticky top-0 z-10 shadow-sm border-b border-gray-200">
    <div className="flex justify-between items-center px-4 py-3 md:px-6 md:py-4">
      
      {/* WRAPPER KIRI */}
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

      {/* ACTION BUTTONS (Kanan) */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* UPDATE LINK DI SINI */}
        {/* Mengarah ke /dashboard/notification sesuai struktur folder */}
        <Link href="/dashboard/notification">
          <button 
            className="relative text-gray-500 hover:text-gray-700 p-1.5 md:p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Notifikasi"
          >
            <Bell className="w-5 h-5 md:w-6 md:h-6" />
            
            {/* Indikator titik merah */}
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </Link>
        
      </div>

    </div>
  </header>
);

export default Header;