import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface Section {
  id: string;
  label: string;
}

export default function StickyNav() {
  const { pathname } = useLocation();
  // Normalizar la ruta para soportar subcarpetas (como /rose-coffee/ en GitHub Pages)
  const cleanPath = pathname.replace(/^\/rose-coffee/, '').replace(/\/$/, '') || '/';
  const [activeSection, setActiveSection] = useState('');
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // Determinar secciones según la ruta activa
  let SECTIONS: Section[] = [];
  if (cleanPath === '/' || cleanPath === '/inicio') {
    SECTIONS = [
      { id: 'hero', label: 'Inicio' },
      { id: 'experience', label: 'Experiencia' },
      { id: 'products', label: 'Favoritos' },
      { id: 'location', label: 'Visítanos' },
    ];
  } else if (cleanPath === '/tienda') {
    SECTIONS = [
      { id: 'store_hero', label: 'Tienda' },
      { id: 'store_filters', label: 'Filtros' },
      { id: 'store_grid', label: 'Productos' },
    ];
  } else if (cleanPath === '/nosotros') {
    SECTIONS = [
      { id: 'about_hero', label: 'Quiénes Somos' },
      { id: 'about_vision_mission', label: 'Misión & Visión' },
      { id: 'about_history', label: 'Nuestra Historia' },
      { id: 'about_pillars', label: 'Pilares' },
      { id: 'about_pastoral', label: 'El Equipo' },
    ];
  } else if (cleanPath === '/contacto') {
    SECTIONS = [
      { id: 'contact_hero', label: 'Contacto' },
      { id: 'contact_info', label: 'Información' },
      { id: 'contact_form', label: 'Escríbenos' },
    ];
  }

  useEffect(() => {
    if (SECTIONS.length > 0) {
      setActiveSection(SECTIONS[0].id);
    }
  }, [cleanPath]);

  useEffect(() => {
    if (SECTIONS.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '-35% 0px -35% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    SECTIONS.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      SECTIONS.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [cleanPath, SECTIONS.length]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (SECTIONS.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-5 bg-[#faf2e7]/95 backdrop-blur-md px-3.5 py-7 rounded-full border border-gold/20 shadow-lg select-none">
      {SECTIONS.map((section) => {
        const isActive = activeSection === section.id;
        const isHovered = hoveredSection === section.id;

        return (
          <div
            key={section.id}
            className="relative flex items-center justify-center cursor-pointer group"
            onMouseEnter={() => setHoveredSection(section.id)}
            onMouseLeave={() => setHoveredSection(null)}
            onClick={() => scrollToSection(section.id)}
          >
            {/* Tooltip Label */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: 10, scale: 0.95 }}
                  animate={{ opacity: 1, x: -10, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-8 px-3 py-1 bg-primary text-[#faf2e7] text-xs font-bold rounded-lg shadow-md whitespace-nowrap border border-white/10 pointer-events-none"
                >
                  {section.label}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Indicator Dot */}
            <div className="relative w-6 h-6 flex items-center justify-center">
              {/* Active Outer Ring */}
              {isActive && (
                <motion.div
                  layoutId="activeRing"
                  className="absolute inset-0 rounded-full border-2 border-[#6b3a0e] bg-transparent shadow-xs"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* Inner Circle Dot */}
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : isHovered ? 1.3 : 1,
                  backgroundColor: isActive ? '#6b3a0e' : isHovered ? '#c8922a' : '#021a54',
                }}
                className={`w-2.5 h-2.5 rounded-full transition-transform duration-300`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
