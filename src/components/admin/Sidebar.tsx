import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, Globe } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { ADMIN_MODULES } from '../../config/adminModules';
import logoRose from '../../assets/logo rose coffee/1 rose coffee.svg';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, userRole, firstName, lastName, photoUrl, logout } = useAuthStore();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // 768px matches md breakpoint
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/login');
  };

  // Filter items visible to the current user's permissions
  const visibleNavItems = ADMIN_MODULES.filter(item => 
    hasPermission(item.id, 'view')
  );

  const nameStr = firstName && lastName ? `${firstName} ${lastName}` : user?.email?.split('@')[0] || 'Administrador';

  const sidebarContent = (
    <div className="w-64 bg-primary text-white h-screen flex flex-col shadow-2xl select-none">
      
      {/* Sidebar Header: Logo Rose Coffee */}
      <div className="p-5 border-b border-white/10 flex justify-between items-center bg-primary-dark">
        <div className="flex items-center gap-2.5 mx-auto">
          <img src={logoRose} alt="Rose Coffee Logo" className="h-10 w-auto flex-shrink-0 animate-float" />
          <h2 className="font-sans text-lg font-bold tracking-wide text-white">Rose Coffee</h2>
        </div>
        {isMobile && (
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Admin Profile Area */}
      <div className="px-6 py-5 border-b border-white/10 bg-primary/40 text-center flex flex-col items-center gap-1.5">
        {photoUrl ? (
          <img 
            src={photoUrl} 
            alt="Foto perfil administrador" 
            className="w-12 h-12 rounded-full object-cover border-2 border-gold/40 shadow-md"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gold/10 text-gold border border-gold/25 flex items-center justify-center font-bold text-lg uppercase shadow-sm">
            {nameStr[0]}
          </div>
        )}
        <div className="w-full">
          <p className="truncate font-bold text-xs text-stone-100 max-w-[190px]" title={nameStr}>
            {nameStr}
          </p>
          <span className="capitalize text-[8px] font-bold bg-gold/20 text-gold border border-gold/30 px-2.5 py-0.5 rounded-full inline-block mt-1 tracking-wider uppercase select-none">
            {userRole}
          </span>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar-dark">
        <ul className="space-y-1">
          {visibleNavItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                end={item.path === '/admin'}
                onClick={() => {
                  if (isMobile) onClose();
                }}
                className={({ isActive }) => 
                  `flex items-center gap-3.5 px-6 py-2.5 transition-all duration-200 border-l-4 text-[10px] font-bold uppercase tracking-widest ${
                    isActive 
                      ? 'bg-white/5 border-gold text-white font-extrabold shadow-sm' 
                      : 'hover:bg-white/5 border-transparent text-stone-400 hover:text-white'
                  }`
                }
              >
                <item.icon size={16} />
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <button 
          onClick={() => {
            onClose();
            navigate('/');
          }}
          className="flex items-center justify-center gap-2 text-stone-300 hover:text-white hover:bg-white/5 py-2 px-4 rounded-xl transition-all duration-200 w-full text-xs font-semibold border border-white/5 hover:border-white/10 cursor-pointer"
        >
          <Globe size={14} className="text-gold" />
          <span>Cerrar Panel</span>
        </button>

        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 text-red-400 hover:text-red-350 hover:bg-red-950/20 py-2 px-4 rounded-xl transition-all duration-200 w-full text-xs font-semibold cursor-pointer"
        >
          <LogOut size={14} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="fixed top-0 bottom-0 left-0 z-50 h-screen"
          >
            {sidebarContent}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="fixed top-0 bottom-0 left-0 z-20 w-64 hidden md:block">
      {sidebarContent}
    </div>
  );
};

export default Sidebar;

