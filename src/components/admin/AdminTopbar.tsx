import { useState } from 'react';
import { Search, Bell, Menu, LogOut, Globe, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

interface AdminTopbarProps {
  onMenuClick: () => void;
}

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { user, userRole, firstName, lastName, photoUrl, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Synthetic keypress to toggle CMD/CTRL+K Search menu
  const triggerSearch = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      metaKey: true,
      bubbles: true
    });
    document.dispatchEvent(event);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const nameStr = firstName && lastName ? `${firstName} ${lastName}` : user?.email?.split('@')[0] || 'Administrador';

  return (
    <header className="sticky top-0 bg-primary text-white h-16 px-4 md:px-8 flex items-center justify-between border-b border-white/5 z-30 shadow-sm font-sans select-none">
      
      {/* Left: Mobile hamburger menu toggle */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Abrir menú de navegación"
        >
          <Menu size={20} />
        </button>
        <span className="hidden md:inline text-xs font-bold text-stone-300 font-sans tracking-wide">
          Centro de Operaciones
        </span>
      </div>

      {/* Center: Search trigger spotlight button */}
      <button 
        onClick={triggerSearch}
        className="flex items-center justify-between gap-10 bg-white/10 text-white/70 hover:bg-white/15 px-4 py-2.5 rounded-xl border border-white/5 shadow-2xs hover:shadow-xs transition-all w-64 md:w-80 cursor-pointer text-xs"
      >
        <div className="flex items-center gap-2">
          <Search size={14} className="text-white/60" />
          <span className="font-medium">Buscar comandos...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold font-mono bg-white/10 border border-white/10 rounded-md text-white/65 uppercase">
          Ctrl K
        </kbd>
      </button>

      {/* Right: Notifications bell & user profile dropdown */}
      <div className="flex items-center gap-3 md:gap-5">
        
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer relative"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-primary animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-primary" />
          </button>

          {notificationsOpen && (
            <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)} />
          )}

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2.5 w-72 bg-[#021a54] border border-white/10 rounded-2xl shadow-xl py-3 z-40 overflow-hidden text-stone-200"
              >
                <div className="px-4 pb-2.5 border-b border-white/10 text-left">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Alertas del Sistema</h4>
                </div>
                <div className="divide-y divide-white/5 max-h-60 overflow-y-auto text-left custom-scrollbar-dark text-xs">
                  <div className="p-3 hover:bg-white/5 transition-colors">
                    <p className="font-semibold text-white">⚠️ Alerta de Stock Mínimo</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">Croissant de Almendras está bajo el mínimo (3 u.)</p>
                  </div>
                  <div className="p-3 hover:bg-white/5 transition-colors">
                    <p className="font-semibold text-white">🛍️ Nuevo Pedido Entrante</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">Orden #1402 de Ana de Castro en preparación</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 cursor-pointer p-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-bold"
          >
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt="Administrador" 
                className="w-7 h-7 rounded-lg object-cover border border-white/20"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-gold/10 text-gold border border-gold/25 flex items-center justify-center font-bold text-xs uppercase">
                {nameStr[0]}
              </div>
            )}
            <span className="hidden md:inline font-sans truncate max-w-[120px] text-stone-200">
              {firstName || nameStr}
            </span>
            <ChevronDown size={12} className={`text-stone-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
          )}

          <AnimatePresence>
            {profileOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2.5 w-52 bg-[#021a54] border border-white/10 rounded-2xl shadow-xl py-2 z-40 overflow-hidden text-stone-200"
              >
                <div className="px-4 py-3 flex flex-col items-center gap-1.5 border-b border-white/10 text-center">
                  {photoUrl ? (
                    <img 
                      src={photoUrl} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-full object-cover border-2 border-gold/40 shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gold/15 text-gold border border-gold/30 flex items-center justify-center font-bold text-base uppercase">
                      {nameStr[0]}
                    </div>
                  )}
                  <div className="w-full truncate">
                    <p className="text-xs font-bold text-white truncate">{nameStr}</p>
                    <span className="capitalize text-[8px] font-bold bg-gold text-white px-2 py-0.5 rounded shadow-sm inline-block mt-1">
                      {userRole}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/');
                  }}
                  className="flex items-center gap-2.5 px-4 py-2 w-full text-left text-xs font-semibold hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                >
                  <Globe size={14} className="text-gold" />
                  <span>Cerrar Panel</span>
                </button>

                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-4 py-2 w-full text-left text-xs font-semibold hover:bg-red-950/20 text-red-400 hover:text-red-350 transition-colors cursor-pointer border-t border-white/5"
                >
                  <LogOut size={14} />
                  <span>Cerrar Sesión</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </header>
  );
}
