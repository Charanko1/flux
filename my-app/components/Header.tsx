import { Bell, Menu } from 'lucide-react'; // 1. Jangan lupa import Menu

// 2. Tambahkan prop 'onMenuClick'
const Header = ({ title, onMenuClick }) => (
  <header className="bg-white sticky top-0 z-10 shadow-sm border-b border-gray-200">
    <div className="flex justify-between items-center px-4 py-3 md:px-6 md:py-4">
      
      {/* WRAPPER KIRI: Gabungan Tombol Menu + Judul */}
      <div className="flex items-center gap-3 overflow-hidden max-w-[70%]">
        
        {/* --- TOMBOL MENU (MOBILE ONLY) --- */}
        {/* md:hidden artinya hilang di desktop */}
        <button 
          onClick={onMenuClick}
          className="md:hidden text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu size={24} />
        </button>
        {/* --------------------------------- */}

        {/* TITLE */}
        <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
          {title}
        </h1>
      </div>

      {/* ACTION BUTTONS (Kanan) */}
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          className="text-gray-500 hover:text-gray-700 p-1.5 md:p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          aria-label="Notifikasi"
        >
          <Bell className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

    </div>
  </header>
);

export default Header;