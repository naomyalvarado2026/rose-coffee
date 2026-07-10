import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, Layers, ShoppingCart, User, Gamepad2, Info, FileText, Phone, Store, Sparkles, LayoutGrid, ChevronUp } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const openDrawer = useCartStore((state) => state.openDrawer);
  const { user } = useAuthStore();
  
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveGroup(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close popovers when route changes
  useEffect(() => {
    setActiveGroup(null);
  }, [location.pathname]);

  const NAV_CONFIG = [
    {
      id: 'inicio',
      label: 'Inicio',
      icon: Home,
      type: 'link',
      path: '/'
    },
    {
      id: 'compras',
      label: 'Comprar',
      icon: Store,
      type: 'group',
      items: [
        { path: '/tienda', label: 'Tienda', icon: ShoppingBag, color: 'text-orange-500' },
        { action: 'cart', label: 'Carrito', icon: ShoppingCart, badge: totalItems, color: 'text-amber-500' }
      ]
    },
    {
      id: 'entretenimiento',
      label: 'Jugar',
      icon: Sparkles,
      type: 'group',
      items: [
        { path: '/juegos', label: 'Juegos', icon: Gamepad2, color: 'text-indigo-500' },
        { path: '/ar', label: 'AR 3D', icon: Layers, color: 'text-fuchsia-500' }
      ]
    },
    {
      id: 'explorar',
      label: 'Más',
      icon: LayoutGrid,
      type: 'group',
      items: [
        { path: user ? '/mis-compras' : '/login', label: user ? 'Mi Perfil' : 'Ingresar', icon: User, color: 'text-blue-500' },
        { path: '/blog', label: 'Blog', icon: FileText, color: 'text-rose-500' },
        { path: '/nosotros', label: 'Nosotros', icon: Info, color: 'text-emerald-500' },
        { path: '/contacto', label: 'Contacto', icon: Phone, color: 'text-teal-500' }
      ]
    }
  ];

  const handleAction = (item: any) => {
    setActiveGroup(null);
    if (item.action === 'cart') {
      openDrawer();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const isGroupActive = (config: any) => {
    if (config.type === 'link') return location.pathname === config.path;
    return config.items?.some((item: any) => item.path && location.pathname === item.path);
  };

  return (
    <nav ref={navRef} className="print:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border-t border-stone-200 dark:border-stone-800 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] px-2 py-2 pb-safe md:hidden flex justify-around items-center">
      {NAV_CONFIG.map((config) => {
        const Icon = config.icon;
        const isActive = isGroupActive(config);
        const isOpen = activeGroup === config.id;

        return (
          <div key={config.id} className="relative flex-1 flex justify-center">
            {/* Botón Principal del Nav */}
            <button
              onClick={() => {
                if (config.type === 'link' && config.path) {
                  navigate(config.path);
                  setActiveGroup(null);
                } else {
                  setActiveGroup(isOpen ? null : config.id);
                }
              }}
              className="flex flex-col items-center justify-center relative py-1 w-full text-stone-500 active:scale-95 transition-transform focus-visible:outline-none group"
            >
              <div className="relative p-1.5">
                <Icon 
                  size={24} 
                  strokeWidth={isActive || isOpen ? 2.5 : 2}
                  className={`transition-all duration-300 ${
                    isActive || isOpen ? 'text-coffee dark:text-gold scale-110' : 'text-stone-500 dark:text-stone-400'
                  }`} 
                />
                
                {/* Global badge indicator for group if needed (e.g. cart items) */}
                {config.type === 'group' && config.items?.some(i => i.badge && i.badge > 0) && (
                  <span className="absolute -top-1 -right-1 bg-coffee text-[#faf2e7] text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-stone-900 shadow-sm">
                    {config.items.find(i => i.badge)?.badge}
                  </span>
                )}
              </div>
              
              <span className={`text-[10px] font-bold mt-0.5 tracking-wide transition-colors duration-200 ${
                isActive || isOpen ? 'text-coffee dark:text-gold' : 'text-stone-500 dark:text-stone-400'
              }`}>
                {config.label}
              </span>

              {/* Active Dot */}
              {isActive && !isOpen && (
                <motion.div
                  layoutId="mobile-nav-dot"
                  className="absolute bottom-[-6px] w-1.5 h-1.5 bg-coffee dark:bg-gold rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              
              {/* Caret for open dropdown */}
              {config.type === 'group' && (
                <ChevronUp size={12} className={`absolute bottom-[-8px] transition-transform duration-300 ${isOpen ? 'rotate-180 text-coffee dark:text-gold opacity-100' : 'opacity-0'}`} />
              )}
            </button>

            {/* Popover / Tarjeta Desplegable */}
            <AnimatePresence>
              {isOpen && config.type === 'group' && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="absolute bottom-[calc(100%+12px)] min-w-[160px] max-w-[200px] w-max bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-100 dark:border-stone-700 p-2 z-50 flex flex-col gap-1 overflow-hidden"
                  style={{
                    // Prevent popover from going off screen on edges
                    left: config.id === 'compras' ? '0' : config.id === 'explorar' ? 'auto' : '50%',
                    right: config.id === 'explorar' ? '0' : 'auto',
                    transform: config.id === 'compras' || config.id === 'explorar' ? 'none' : 'translateX(-50%)'
                  }}
                >
                  {/* Flechita (Tooltip Arrow) */}
                  <div 
                    className="absolute -bottom-2 w-4 h-4 bg-white dark:bg-stone-800 border-b border-r border-stone-100 dark:border-stone-700 rotate-45"
                    style={{
                      left: config.id === 'compras' ? '24px' : config.id === 'explorar' ? 'auto' : '50%',
                      right: config.id === 'explorar' ? '24px' : 'auto',
                      transform: config.id === 'compras' || config.id === 'explorar' ? 'none' : 'translateX(-50%)'
                    }}
                  />
                  
                  {/* Opciones */}
                  {config.items?.map((item: any, idx: number) => {
                    const isItemActive = location.pathname === item.path;
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAction(item)}
                        className={`relative z-10 w-full flex items-center gap-3 p-3 rounded-xl transition-colors active:scale-95 ${
                          isItemActive 
                            ? 'bg-coffee/5 dark:bg-gold/10 text-coffee dark:text-gold font-bold' 
                            : 'hover:bg-stone-50 dark:hover:bg-stone-700/50 text-stone-700 dark:text-stone-200 font-semibold'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${isItemActive ? 'bg-coffee/10 dark:bg-gold/20' : 'bg-stone-100 dark:bg-stone-700'}`}>
                          <ItemIcon size={18} className={isItemActive ? '' : item.color} />
                        </div>
                        <span className="text-sm tracking-tight">{item.label}</span>
                        
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="ml-auto bg-coffee text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}
