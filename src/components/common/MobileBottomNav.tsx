import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Layers, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { motion } from 'framer-motion';

export default function MobileBottomNav() {
  const location = useLocation();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const openDrawer = useCartStore((state) => state.openDrawer);
  const { user } = useAuthStore();

  const NAV_ITEMS = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/tienda', label: 'Tienda', icon: ShoppingBag },
    { path: '/ar', label: 'AR 3D', icon: Layers },
    { path: '/cart', label: 'Carrito', icon: ShoppingCart, badge: totalItems },
    { path: user ? '/mis-compras' : '/login', label: 'Perfil', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-stone-800/85 backdrop-blur-md border-t border-stone-200 dark:border-stone-700/60 shadow-lg px-4 py-2.5 md:hidden flex justify-around items-center">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return item.path === '/cart' ? (
          <button
            key={item.path}
            onClick={openDrawer}
            className="flex flex-col items-center justify-center relative py-1 flex-1 text-stone-500 active:scale-95 transition-transform focus-visible:outline-none"
          >
            <div className="relative p-1">
              <Icon 
                size={20} 
                className={`transition-colors duration-200 text-stone-500`}
              />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-coffee text-[#faf2e7] text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-xxs">
                  {item.badge}
                </span>
              )}
            </div>
            
            <span className={`text-[9px] font-bold mt-0.5 tracking-wide transition-colors duration-200 text-stone-500`}>
              {item.label}
            </span>
          </button>
        ) : (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center justify-center relative py-1 flex-1 text-stone-500 active:scale-95 transition-transform"
          >
            <div className="relative p-1">
              <Icon 
                size={20} 
                className={`transition-colors duration-200 ${
                  isActive ? 'text-coffee dark:text-gold' : 'text-stone-500 hover:text-stone-700'
                }`}
              />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-coffee text-[#faf2e7] text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-xxs">
                  {item.badge}
                </span>
              )}
            </div>
            
            <span className={`text-[9px] font-bold mt-0.5 tracking-wide transition-colors duration-200 ${
              isActive ? 'text-coffee dark:text-gold' : 'text-stone-500'
            }`}>
              {item.label}
            </span>

            {/* Active Indicator Dot */}
            {isActive && (
              <motion.div
                layoutId="mobile-nav-dot"
                className="absolute bottom-[-4px] w-1 h-1 bg-coffee rounded-full"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
