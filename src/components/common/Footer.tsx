import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoRose from '../../assets/logo rose coffee/1 rose coffee.svg';
import {
  Mail, Phone, MapPin, Clock, Heart, MessageCircle
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://facebook.com',
      iconRenderer: () => (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
        </svg>
      ),
      color: 'hover:bg-blue-600 hover:text-white hover:border-blue-600'
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com',
      iconRenderer: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
      color: 'hover:bg-coffee hover:text-white hover:border-coffee'
    },
    {
      name: 'WhatsApp',
      url: 'https://wa.me/593980372113',
      iconRenderer: () => <MessageCircle size={16} />,
      color: 'hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
    }
  ];

  const quickLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Tienda de Café', path: '/tienda' },
    { name: 'Nosotros', path: '/nosotros' },
    { name: 'Visualización AR 3D', path: '/ar' },
    { name: 'Contacto', path: '/contacto' }
  ];

  // Framer Motion column animation definition
  const columnFadeInUp = {
    hidden: { opacity: 0, y: 35 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring' as const, stiffness: 90, damping: 15 }
    }
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#021a54] to-[#010c27] text-white overflow-hidden border-t-4 border-gold/75 mt-auto">
      
      {/* Decorative background light rays & breathing ambient orbs (smooth slow orbit) */}
      <motion.div 
        animate={{ 
          x: [0, 40, -30, 0], 
          y: [0, -30, 20, 0],
          scale: [1, 1.15, 0.9, 1]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 25, 
          ease: 'easeInOut' 
        }}
        className="absolute top-0 left-0 w-96 h-96 bg-blue-800/15 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" 
      />
      
      <motion.div 
        animate={{ 
          x: [0, -30, 50, 0], 
          y: [0, 40, -20, 0],
          scale: [1, 0.9, 1.1, 1]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 30, 
          ease: 'easeInOut' 
        }}
        className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-gold/5 rounded-full blur-[130px] translate-x-1/3 translate-y-1/3 pointer-events-none" 
      />
      
      <div className="absolute top-1/2 left-2/3 w-[300px] h-[300px] bg-coffee/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-8 relative z-10">

        {/* Main Grid with stagger animation */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.12 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16"
        >

          {/* Column 1: Identity */}
          <motion.div variants={columnFadeInUp} className="space-y-6">
            <Link to="/" className="inline-block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-lg p-1">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={logoRose} alt="Rose Coffee Logo" className="h-12 w-auto transition-transform duration-500 group-hover:scale-105 group-hover:rotate-6" />
                  
                  {/* Rich multi-trail steam rising animation */}
                  <div className="absolute -top-4.5 left-[42%] -translate-x-1/2 flex gap-1 pointer-events-none opacity-80">
                    <div className="w-0.5 h-3 bg-gold/40 rounded-full blur-[0.5px] animate-steam" style={{ animationDelay: '0.2s', animationDuration: '2.2s' }} />
                    <div className="w-0.5 h-5 bg-gold/50 rounded-full blur-[0.6px] animate-steam" style={{ animationDelay: '0.7s', animationDuration: '2.5s' }} />
                    <div className="w-0.5 h-4 bg-gold/65 rounded-full blur-[0.5px] animate-steam" style={{ animationDelay: '0s', animationDuration: '2.0s' }} />
                    <div className="w-0.5 h-2.5 bg-gold/30 rounded-full blur-[0.7px] animate-steam" style={{ animationDelay: '1.2s', animationDuration: '2.3s' }} />
                  </div>
                </div>
                <div className="text-left">
                  <span className="font-sans text-2xl font-bold text-white tracking-tight group-hover:text-gold transition-colors block leading-tight">
                    Rose Coffee
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-gold/90 block mt-0.5">
                    Café de Especialidad y Masa Madre
                  </span>
                </div>
              </div>
            </Link>

            <p className="text-xs text-gray-350 leading-relaxed max-w-sm italic">
              "La combinación perfecta entre el mejor grano de café de especialidad y la fermentación natural del pan de masa madre."
            </p>

            {/* Social media icons with glowing bubble effects */}
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover="hover"
                  whileTap={{ scale: 0.95 }}
                  className={`relative w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 transition-all duration-300 shadow-sm overflow-hidden ${social.color}`}
                  title={social.name}
                >
                  <motion.div
                    variants={{
                      hover: { scale: 1.8, opacity: 0.25 }
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="absolute inset-0 bg-white opacity-0 rounded-xl blur-[2px] pointer-events-none"
                  />
                  <motion.div
                    variants={{
                      hover: { scale: 1.15, rotate: 8 }
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="relative z-10"
                  >
                    {social.iconRenderer()}
                  </motion.div>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Navigation links */}
          <motion.div variants={columnFadeInUp}>
            <h4 className="font-sans font-bold text-base text-white border-b border-white/10 pb-3 mb-6 tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gold rounded-full" />
              Enlaces Rápidos
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 text-xs text-gray-300 font-medium">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>
                    <motion.div 
                      whileHover="hover" 
                      className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      <motion.span 
                        variants={{
                          hover: { x: 3, scale: 1.2, color: '#c8922a' }
                        }}
                        className="text-[9px] text-gold/60 inline-block font-extrabold"
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      >
                        ➔
                      </motion.span>
                      <motion.span
                        variants={{
                          hover: { x: 3 }
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      >
                        {link.name}
                      </motion.span>
                    </motion.div>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Contact Info */}
          <motion.div variants={columnFadeInUp} className="space-y-6">
            <h4 className="font-sans font-bold text-base text-white border-b border-white/10 pb-3 mb-6 tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gold rounded-full" />
              Contacto
            </h4>
            <div className="space-y-4 text-xs text-gray-300 leading-relaxed font-medium">
              
              <motion.div 
                whileHover="hover"
                className="flex items-start gap-3 cursor-pointer"
              >
                <motion.div
                  variants={{
                    hover: { scale: 1.15, rotate: [0, -10, 10, 0] }
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <MapPin size={16} className="text-gold shrink-0 mt-0.5" />
                </motion.div>
                <motion.address 
                  variants={{ hover: { x: 3, color: '#ffffff' } }} 
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="not-italic"
                >
                  E25 y Av. 17 de Septiembre<br />
                  Milagro, Ecuador
                </motion.address>
              </motion.div>

              <motion.div 
                whileHover="hover"
                className="flex items-center gap-3 cursor-pointer"
              >
                <motion.div
                  variants={{
                    hover: { scale: 1.15, rotate: [0, -15, 15, 0] }
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <Phone size={16} className="text-gold shrink-0" />
                </motion.div>
                <motion.a 
                  href="tel:+593980372113" 
                  variants={{ hover: { x: 3, color: '#ffffff' } }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="transition-colors"
                >
                  +593 98 037 2113
                </motion.a>
              </motion.div>

              <motion.div 
                whileHover="hover"
                className="flex items-center gap-3 cursor-pointer"
              >
                <motion.div
                  variants={{
                    hover: { scale: 1.15, rotate: [0, -10, 10, 0] }
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <Mail size={16} className="text-gold shrink-0" />
                </motion.div>
                <motion.a 
                  href="mailto:contacto@rosecoffee.com" 
                  variants={{ hover: { x: 3, color: '#ffffff' } }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="transition-colors"
                >
                  contacto@rosecoffee.com
                </motion.a>
              </motion.div>

            </div>
          </motion.div>

          {/* Column 4: Coffee Shop Hours */}
          <motion.div variants={columnFadeInUp}>
            <h4 className="font-sans font-bold text-base text-white border-b border-white/10 pb-3 mb-6 tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gold rounded-full" />
              Horarios de Atención
            </h4>
            
            <motion.div 
              whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(200, 146, 42, 0.15)' }}
              transition={{ type: 'spring' as const, stiffness: 200, damping: 18 }}
              className="space-y-3.5 text-xs text-gray-300 leading-relaxed font-medium bg-white/5 border border-white/10 p-4 rounded-2xl shadow-inner backdrop-blur-md"
            >
              <div className="flex items-start gap-2.5">
                <Clock size={16} className="text-gold shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="font-bold text-white text-[11px] uppercase tracking-wider">Tienda Física</p>
                  <p className="mt-0.5 text-gray-350">Lunes a Sábado: 8:00 AM - 8:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5 border-t border-white/10 pt-3">
                <Clock size={16} className="text-gold shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="font-bold text-white text-[11px] uppercase tracking-wider">Pedidos Online / Envíos</p>
                  <p className="mt-0.5 text-gray-350">Entregas todos los días de 9:00 AM - 5:00 PM</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </motion.div>

        {/* Bottom Bar: Copyright */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, type: 'spring' as const, stiffness: 100, damping: 15 }}
          className="border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left text-xs text-gray-405"
        >
          <p className="font-medium text-gray-400">
            &copy; {currentYear} Rose Coffee. Todos los derechos reservados.
          </p>
          <div className="flex flex-col items-center md:items-end text-[10px] text-gray-500">
            <p className="flex items-center gap-1.5 font-medium">
              Creado por Naomy con
              <Heart size={10} className="text-accent-red fill-accent-red animate-pulse" />
              Rose Coffee
            </p>
          </div>
        </motion.div>

      </div>
    </footer>
  );
};

export default Footer;
