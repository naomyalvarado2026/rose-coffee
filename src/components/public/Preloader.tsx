import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.svg';

export default function Preloader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 2000);
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
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ 
              opacity: 1, 
              scale: [0.97, 1.03, 0.97],
            }}
            transition={{
              opacity: { duration: 0.5, ease: 'easeOut' },
              scale: { 
                repeat: Infinity, 
                duration: 1.4, 
                ease: 'easeInOut' 
              }
            }}
            className="flex items-center justify-center"
            style={{ width: '200px', height: '200px' }}
          >
            <img 
              src={logo} 
              alt="Rose Coffee Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          </motion.div>

          {/* Brand text — forced Inter sans-serif */}
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: '18px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#6b3a0e',
              marginTop: '20px',
            }}
          >
            Rose Coffee
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
