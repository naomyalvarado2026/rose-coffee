import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, Layers, ShoppingCart, User, Menu, X, Gamepad2, Info, FileText, Phone } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const openDrawer = useCartStore((state) => state.openDrawer);
  const { user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Bottom Navigation Bar Items (Primary)
  const PRIMARY_NAV_ITEMS = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/tienda', label: 'Tienda', icon: ShoppingBag },
    { path: '/ar', label: 'AR 3D', icon: Layers },
    { path: '/cart', label: 'Carrito', icon: ShoppingCart, badge: totalItems },
  ];

  // Secondary Menu Items (Inside Bottom Sheet)
  const SECONDARY_MENU_ITEMS = [
    { path: '/juegos', label: 'Juegos', icon: Gamepad2, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { path: user ? '/mis-compras' : '/login', label: user ? 'Mi Perfil' : 'Iniciar Sesión', icon: User, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { path: '/nosotros', label: 'Nosotros', icon: Info, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { path: '/blog', label: 'Blog', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { path: '/contacto', label: 'Contacto', icon: Phone, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' }
  ];

  const handleNavClick = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <nav className="print:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-stone-800/90 backdrop-blur-xl border-t border-stone-200 dark:border-stone-700/60 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-2 py-2 md:hidden flex justify-between items-center pb-safe">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return item.path === '/cart' ? (
            <button
              key={item.path}
              onClick={() => { setIsMenuOpen(false); openDrawer(); }}
              className="flex flex-col items-center justify-center relative py-1 flex-1 text-stone-500 active:scale-95 transition-transform focus-visible:outline-none"
            >
              <div className="relative p-1">
                <Icon size={22} className="transition-colors duration-200 text-stone-500" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-coffee text-[#faf2e7] text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white dark:border-stone-800 shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold mt-1 tracking-wide transition-colors duration-200 text-stone-500">
                {item.label}
              </span>
            </button>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className="flex flex-col items-center justify-center relative py-1 flex-1 text-stone-500 active:scale-95 transition-transform"
            >
              <div className="relative p-1">
                <Icon 
                  size={22} 
                  className={`transition-colors duration-200 ${
                    isActive ? 'text-coffee dark:text-gold' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                  }`}
                />
              </div>
              
              <span className={`text-[10px] font-bold mt-1 tracking-wide transition-colors duration-200 ${
                isActive ? 'text-coffee dark:text-gold' : 'text-stone-500'
              }`}>
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="mobile-nav-dot"
                  className="absolute bottom-[-6px] w-1 h-1 bg-coffee dark:bg-gold rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}

        {/* Botón Menú (Abre el Bottom Sheet) */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="flex flex-col items-center justify-center relative py-1 flex-1 text-stone-500 active:scale-95 transition-transform focus-visible:outline-none"
        >
          <div className="relative p-1">
            <Menu size={22} className={`transition-colors duration-200 ${isMenuOpen ? 'text-coffee dark:text-gold' : 'text-stone-500'}`} />
          </div>
          <span className={`text-[10px] font-bold mt-1 tracking-wide transition-colors duration-200 ${isMenuOpen ? 'text-coffee dark:text-gold' : 'text-stone-500'}`}>
            Menú
          </span>
        </button>
      </nav>

      {/* Bottom Sheet Modal */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm md:hidden"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-[60px] left-0 right-0 z-50 bg-white dark:bg-stone-900 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-stone-100 dark:border-stone-800 p-6 md:hidden overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Grab handle */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full" />

              <div className="flex justify-between items-center mb-6 mt-2">
                <h3 className="text-xl font-extrabold text-primary dark:text-white">Explorar</h3>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-white rounded-full transition-colors active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-4 scrollbar-hide">
                {SECONDARY_MENU_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all active:scale-95 ${
                        isActive 
                          ? 'border-coffee dark:border-gold bg-coffee/5 dark:bg-gold/10' 
                          : 'border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100'
                      }`}
                    >
                      <div className={`p-3 rounded-xl mb-3 ${item.bg}`}>
                        <Icon size={26} className={item.color} />
                      </div>
                      <span className={`text-sm font-bold ${isActive ? 'text-coffee dark:text-gold' : 'text-stone-700 dark:text-stone-300'}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
