import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';
import logoRose from '../../assets/logo rose coffee/2 rose coffee.svg';
import { slideInRight, staggerContainer, fadeInUp } from '../../utils/animations';

import ThemeToggle from './ThemeToggle';

const Navigation = () => {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const openDrawer = useCartStore((state) => state.openDrawer);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => {
    setIsOpen(false);
  };

  // Helper to check active paths
  const isPathActive = (path: string) => location.pathname === path;

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !isScrolled;

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Tienda', path: '/tienda' },
    { name: 'Nosotros', path: '/nosotros' },
    { name: 'Blog', path: '/blog' },
    { name: 'AR 3D', path: '/ar' },
    { name: 'Juegos', path: '/juegos' },
    { name: 'Contacto', path: '/contacto' },
  ];

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`transition-colors duration-500 ease-in-out ${
      isTransparent 
        ? 'absolute top-[38px] sm:top-[40px] left-0 right-0 w-full bg-transparent border-transparent z-50' 
        : 'bg-white/70 backdrop-blur-lg sticky top-0 z-50 shadow-sm border-b border-white/20'
    }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <Link 
          to="/" 
          onClick={closeMenu} 
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg p-1"
        >
          <img 
            src={logoRose} 
            alt="Logo Rose Coffee" 
            width={46}
            height={48}
            className={`h-12 w-auto transition-transform duration-300 group-hover:scale-105 ${
              isTransparent ? 'brightness-0 invert' : ''
            }`}
          />
          <span className={`text-2xl font-sans font-bold tracking-tight transition-all duration-500 ${
            isTransparent 
              ? 'text-[#faf2e7] drop-shadow-sm' 
              : 'text-primary group-hover:text-coffee'
          }`}>
            Rose Coffee
          </span>
        </Link>
        
        {/* Enlaces Escritorio */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 font-semibold text-sm" onMouseLeave={() => setHoveredPath(null)}>
          <ul className={`flex items-center transition-colors duration-500 ${
            isTransparent ? 'text-[#faf2e7]' : 'text-primary'
          }`}>
            {navLinks.filter(l => l.name !== 'Tienda').map((link) => (
              <li 
                key={link.path}
                className="relative px-3 py-2"
                onMouseEnter={() => setHoveredPath(link.path)}
              >
                {/* Bubble Hover Animation */}
                {hoveredPath === link.path && (
                  <motion.div
                    layoutId="desktopNavHover"
                    className="absolute inset-0 bg-coffee/10 rounded-xl -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                
                {/* Active Indicator Underline */}
                {isPathActive(link.path) && (
                  <motion.div
                    layoutId="desktopNavActive"
                    className="absolute bottom-1 left-3 right-3 h-[2px] bg-coffee rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <Link 
                  to={link.path} 
                  className={`relative z-10 transition-colors duration-300 block ${
                    isTransparent
                      ? (isPathActive(link.path) ? 'text-gold font-bold' : 'hover:text-gold text-[#faf2e7]/85')
                      : (isPathActive(link.path) ? 'text-coffee font-bold' : 'hover:text-coffee')
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Highlighted Tienda Button */}
          <Link
            to="/tienda"
            className={`px-4.5 py-2 rounded-xl text-xs font-black transition-all shadow-xxs cursor-pointer hover:scale-105 active:scale-95 ${
              isTransparent
                ? 'bg-primary text-[#faf2e7] hover:bg-coffee hover:shadow-lg'
                : 'bg-coffee text-[#faf2e7] hover:bg-coffee-dark hover:shadow-lg'
            }`}
          >
            Tienda
          </Link>
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Cart Icon in Navbar */}
          <button
            onClick={openDrawer}
            className={`relative p-2 transition-colors duration-200 cursor-pointer group focus-visible:outline-none ${
              isTransparent ? 'text-[#faf2e7] hover:text-gold' : 'text-primary hover:text-coffee'
            }`}
            aria-label="Ver carrito"
          >
            <motion.div whileHover={{ scale: 1.1, rotate: -5 }} whileTap={{ scale: 0.9 }}>
              <ShoppingCart size={20} />
            </motion.div>
            {totalItems > 0 && (
              <motion.span 
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                transition={{ type: "spring", stiffness: 300, damping: 10, duration: 0.5 }}
                key={`badge-${totalItems}`}
                className="absolute top-0 right-0 bg-coffee text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
              >
                {totalItems}
              </motion.span>
            )}
          </button>
        </div>

        {/* Hamburguesa Móvil */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleMenu}
          className={`md:hidden p-2 focus:outline-none focus:ring-2 rounded-lg transition-all cursor-pointer ${
            isTransparent 
              ? 'text-[#faf2e7] hover:bg-white/10 focus:ring-white/20' 
              : 'text-primary hover:bg-gray-100 focus:ring-primary/10'
          }`}
          aria-label="Toggle menu"
        >
          <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.div>
        </motion.button>
      </div>

      {/* Menú Móvil */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            />

            {/* Side Drawer */}
            <motion.div
              variants={slideInRight}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed right-0 top-0 bottom-0 w-4/5 max-w-sm z-50 bg-white dark:bg-stone-800/90 backdrop-blur-xl border-l border-white/20 shadow-2xl p-6 flex flex-col justify-between md:hidden overflow-y-auto"
            >
              <div>
                <div className="flex justify-between items-center mb-10">
                  <span className="font-sans font-bold text-xl text-primary">Menú</span>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeMenu}
                    className="text-primary p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={24} />
                  </motion.button>
                </div>

                {/* Enlaces de Menú Móvil */}
                <motion.ul 
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="space-y-4 flex flex-col"
                >
                  {navLinks.map((link) => (
                    <motion.li 
                      key={link.path} 
                      variants={fadeInUp}
                      whileHover={{ x: 10, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={link.path}
                        onClick={closeMenu}
                        className={`text-lg font-sans font-bold text-primary block hover:text-coffee transition-colors py-3 px-4 rounded-xl ${
                          isPathActive(link.path) ? 'bg-coffee/10 text-coffee' : 'hover:bg-gray-50'
                        }`}
                      >
                        {link.name}
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>

              {/* Pie de menú móvil */}
              <motion.div 
                variants={fadeInUp}
                className="text-center text-xs text-gray-400 mt-auto pt-6 border-t border-gray-200 dark:border-stone-700 flex flex-col items-center gap-2"
              >
                <img src={logoRose} alt="Logo" width={31} height={32} className="h-8 w-auto opacity-75" />
                <p className="font-medium text-slate-500">Rose Coffee</p>
                <p className="mt-1">© {new Date().getFullYear()} Todos los derechos reservados.</p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navigation;
