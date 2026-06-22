import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.svg';

export default function Preloader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Check if preloader has already run in this session
    const hasSeen = sessionStorage.getItem('rose_coffee_preloader_seen');
    if (hasSeen === 'true') {
      setShow(false);
      return;
    }

    const timer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem('rose_coffee_preloader_seen', 'true');
    }, 1800); // Pulse logo for 1.8s, then slide up

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ 
            y: '-100%',
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
          }}
          className="fixed inset-0 z-[100] bg-brand-base flex flex-col items-center justify-center select-none pointer-events-auto"
        >
          {/* Logo animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              opacity: { duration: 0.5, ease: 'easeOut' },
              scale: { 
                repeat: Infinity, 
                duration: 1.2, 
                ease: 'easeInOut' 
              }
            }}
            className="w-48 h-48 flex items-center justify-center"
          >
            <img src={logo} alt="Rose Coffee Logo" className="w-full h-full object-contain" />
          </motion.div>
          
          {/* Subtle brand text loader */}
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.7, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-[10px] font-bold text-coffee uppercase tracking-widest mt-4"
          >
            Cargando Experiencia...
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
