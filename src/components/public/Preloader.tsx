import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // Use BASE_URL so the path works both locally (/logo.svg)
  // and on GitHub Pages (/rose-coffee/logo.svg)
  const logoSrc = `${import.meta.env.BASE_URL}logo.svg`;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 0 }}
          exit={{
            y: '-100%',
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: '#faf2e7',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
          }}
        >
          {/* Logo — loaded from /public to avoid Vite SVG CSS mangling */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: [0.97, 1.03, 0.97] }}
            transition={{
              opacity: { duration: 0.5, ease: 'easeOut' },
              scale: { repeat: Infinity, duration: 1.4, ease: 'easeInOut' },
            }}
            style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <img
              src={logoSrc}
              alt="Rose Coffee Logo"
              width={200}
              height={200}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          </motion.div>

          {/* Brand text — explicit Inter stack, no Tailwind dependency */}
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{
              fontFamily:
                "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
              fontWeight: 400,
              fontSize: '17px',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#6b3a0e',
              marginTop: '22px',
            }}
          >
            Rose Coffee
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
