import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  Home, Star, Coffee, Calendar, BookOpen, 
  Store, Filter, Grid, 
  Info, Target, Clock, ShieldCheck, Image as ImageIcon, Users, 
  PhoneCall, MapPin, Send
} from 'lucide-react';

interface Section {
  id: string;
  label: string;
  icon: React.ElementType;
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
      { id: 'hero', label: 'Inicio', icon: Home },
      { id: 'experience', label: 'Experiencia', icon: Star },
      { id: 'products', label: 'Favoritos', icon: Coffee },
      { id: 'events', label: 'Eventos', icon: Calendar },
      { id: 'blog', label: 'Blog', icon: BookOpen },
    ];
  } else if (cleanPath === '/tienda') {
    SECTIONS = [
      { id: 'store_hero', label: 'Tienda', icon: Store },
      { id: 'store_filters', label: 'Filtros', icon: Filter },
      { id: 'store_grid', label: 'Productos', icon: Grid },
    ];
  } else if (cleanPath === '/nosotros') {
    SECTIONS = [
      { id: 'about_hero', label: 'Quiénes Somos', icon: Info },
      { id: 'about_vision_mission', label: 'Misión & Visión', icon: Target },
      { id: 'about_history', label: 'Nuestra Historia', icon: Clock },
      { id: 'about_pillars', label: 'Pilares', icon: ShieldCheck },
      { id: 'about_gallery', label: 'Galería', icon: ImageIcon },
      { id: 'about_pastoral', label: 'El Equipo', icon: Users },
    ];
  } else if (cleanPath === '/contacto') {
    SECTIONS = [
      { id: 'contact_hero', label: 'Contacto', icon: PhoneCall },
      { id: 'contact_info', label: 'Información', icon: MapPin },
      { id: 'contact_form', label: 'Escríbenos', icon: Send },
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
      const yOffset = -100; // Offset for fixed navigation header
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  if (SECTIONS.length === 0) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-6 bg-[#faf2e7]/95 backdrop-blur-md px-3.5 py-7 rounded-full border border-gold/20 shadow-lg select-none"
    >
      {SECTIONS.map((section) => {
        const isActive = activeSection === section.id;
        const isHovered = hoveredSection === section.id;
        const Icon = section.icon;

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
                  className="absolute right-10 px-3 py-1.5 bg-primary text-[#faf2e7] text-xs font-bold rounded-lg shadow-md whitespace-nowrap border border-white/10 pointer-events-none"
                >
                  {section.label}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Indicator Dot / Icon */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              {/* Active Outer Ring */}
              {isActive && (
                <motion.div
                  layoutId="activeStickyRing"
                  className="absolute inset-0 rounded-full border-2 border-[#6b3a0e] bg-transparent shadow-xs"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* Inner Circle / Icon Wrapper */}
              <motion.div
                animate={{
                  scale: isActive ? 1.15 : isHovered ? 1.25 : 1,
                  backgroundColor: isActive ? '#6b3a0e' : isHovered ? '#c8922a' : '#021a54',
                  color: isActive ? '#faf2e7' : '#faf2e7'
                }}
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-300 shadow-sm`}
              >
                <Icon size={12} strokeWidth={isActive || isHovered ? 3 : 2} />
              </motion.div>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
