import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';
import logoRose from '../../assets/logo rose coffee/2 rose coffee.svg';
import { slideInRight, staggerContainer, fadeInUp } from '../../utils/animations';

const Navigation = () => {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

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
    { name: 'Contacto', path: '/contacto' },
  ];

  return (
    <nav className={`transition-all duration-500 ease-in-out ${
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
            className="h-12 w-auto transition-transform duration-300 group-hover:scale-105"
          />
          <span className={`text-2xl font-sans font-bold tracking-tight transition-all duration-500 ${
            isTransparent 
              ? 'text-primary drop-shadow-sm' 
              : 'text-primary group-hover:text-coffee'
          }`}>
            Rose Coffee
          </span>
        </Link>
        
        {/* Enlaces Escritorio */}
        <div className="hidden md:flex items-center gap-8 font-semibold text-sm">
          <ul className={`flex gap-6 items-center transition-colors duration-500 ${
            isTransparent ? 'text-primary' : 'text-primary'
          }`}>
            {navLinks.filter(l => l.name !== 'Tienda').map((link) => (
              <li key={link.path}>
                <Link 
                  to={link.path} 
                  className={`transition-colors duration-300 ${
                    isTransparent
                      ? (isPathActive(link.path) ? 'text-coffee font-bold' : 'hover:text-coffee text-primary/80')
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
            className={`px-4.5 py-2 rounded-xl text-xs font-black transition-all shadow-xxs cursor-pointer ${
              isTransparent
                ? 'bg-primary text-[#faf2e7] hover:bg-coffee'
                : 'bg-coffee text-[#faf2e7] hover:bg-coffee-dark'
            }`}
          >
            Tienda
          </Link>
          
          {/* Cart Icon in Navbar */}
          <Link
            to="/cart"
            className="relative p-1 text-primary hover:text-coffee transition-colors duration-200 cursor-pointer"
            aria-label="Ver carrito"
          >
            <ShoppingCart size={18} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-coffee text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-xxs">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* Hamburguesa Móvil */}
        <button
          onClick={toggleMenu}
          className={`md:hidden p-2 focus:outline-none focus:ring-2 rounded-lg transition-all cursor-pointer ${
            isTransparent 
              ? 'text-primary hover:bg-primary/5 focus:ring-primary/10' 
              : 'text-primary hover:bg-gray-100 focus:ring-primary/10'
          }`}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
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
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs md:hidden"
            />

            {/* Side Drawer */}
            <motion.div
              variants={slideInRight}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed right-0 top-0 bottom-0 w-4/5 max-w-sm z-50 bg-white/70 backdrop-blur-lg border-l border-white/20 shadow-2xl p-6 flex flex-col justify-between md:hidden overflow-y-auto"
            >
              <div>
                <div className="flex justify-between items-center mb-10">
                  <span className="font-sans font-bold text-xl text-primary">Menú</span>
                  <button
                    onClick={closeMenu}
                    className="text-primary p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Enlaces de Menú Móvil */}
                <motion.ul 
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="space-y-6 flex flex-col"
                >
                  {navLinks.map((link) => (
                    <motion.li key={link.path} variants={fadeInUp}>
                      <Link
                        to={link.path}
                        onClick={closeMenu}
                        className={`text-lg font-sans font-bold text-primary block hover:text-coffee transition-colors py-2 border-b border-gray-50 ${
                          isPathActive(link.path) ? 'text-coffee border-coffee/20' : ''
                        }`}
                      >
                        {link.name}
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>

              {/* Pie de menú móvil */}
              <div className="text-center text-xs text-gray-400 mt-auto pt-6 border-t border-gray-100 flex flex-col items-center gap-2">
                <img src={logoRose} alt="Logo" className="h-8 w-auto opacity-75" />
                <p className="font-medium text-slate-500">Rose Coffee</p>
                <p className="mt-1">© {new Date().getFullYear()} Todos los derechos reservados.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
