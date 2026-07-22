import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicCard } from '../ui/magic/MagicCard';
import { ShimmerButton } from '../ui/magic/ShimmerButton';
import OptimizedMedia from '../common/OptimizedMedia';
import { Sparkles, Layers, X, ChevronLeft, ChevronRight, Eye, Maximize2, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RenderItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  colSpan: string;
  height: string;
}

const RENDERS_CATALOG: RenderItem[] = [
  {
    id: 'render-1',
    title: 'Barra Principal & Área de Baristas',
    category: 'Zona de Extracción',
    description: 'Diseño abierto en madera cálida y acabados naturales para la interacción directa entre el barista y el cliente.',
    image: '/fotos/local-3d/photo_2026-07-22_00-34-14.jpg',
    colSpan: 'lg:col-span-2 lg:row-span-2',
    height: 'h-full min-h-[380px]'
  },
  {
    id: 'render-2',
    title: 'Salón Principal & Co-Working',
    category: 'Ambiente Interior',
    description: 'Mobiliario ergonómico con iluminación tenue diseñado para disfrutar del café o trabajar con comodidad.',
    image: '/fotos/local-3d/photo_2026-07-22_00-34-10.jpg',
    colSpan: 'lg:col-span-1 lg:row-span-1',
    height: 'h-64'
  },
  {
    id: 'render-3',
    title: 'Taller Abierto de Masa Madre',
    category: 'Área de Panadería',
    description: 'Espacio acristalado donde los visitantes presencian el amasado y horneado artesanal en tiempo real.',
    image: '/fotos/local-3d/photo_2026-07-22_00-34-16.jpg',
    colSpan: 'lg:col-span-1 lg:row-span-1',
    height: 'h-64'
  },
  {
    id: 'render-4',
    title: 'Fachada Externa & Entrada',
    category: 'Arquitectura Exterior',
    description: 'Entrada acogedora con elementos vegetales y concepto arquitectónico distintivo de Rose Coffee.',
    image: '/fotos/local-3d/photo_2026-07-22_00-33-24.jpg',
    colSpan: 'lg:col-span-2 lg:row-span-1',
    height: 'h-64'
  }
];

export const Store3DBentoGrid: React.FC = () => {
  const [selectedRenderIndex, setSelectedRenderIndex] = useState<number | null>(null);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedRenderIndex !== null) {
      setSelectedRenderIndex((prev) => (prev! + 1) % RENDERS_CATALOG.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedRenderIndex !== null) {
      setSelectedRenderIndex((prev) => (prev! - 1 + RENDERS_CATALOG.length) % RENDERS_CATALOG.length);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 text-left">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-coffee/10 dark:bg-gold/10 text-coffee dark:text-gold border border-coffee/20 dark:border-gold/30 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest backdrop-blur-md">
            <Building2 size={14} className="text-gold" />
            <span>Proyecto Arquitectónico 3D</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight font-sans">
            Mosaico 3D de Nuestro <span className="text-coffee dark:text-gold italic font-serif">Futuro Local</span>
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-sm md:text-base leading-relaxed">
            Renders conceptuales en 3D desarrollados en SketchUp. Un espacio diseñado para conectar la pasión por el café de especialidad y el arte de la panadería de masa madre.
          </p>
        </div>

        <Link to="/ar" className="shrink-0">
          <ShimmerButton className="bg-coffee hover:bg-coffee-dark text-white font-bold py-3 px-5 text-xs rounded-2xl border border-coffee/30 shadow-md">
            <Layers size={14} />
            Explorar en Realidad Aumentada 3D
          </ShimmerButton>
        </Link>
      </div>

      {/* Bento Grid Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 auto-rows-fr">
        {RENDERS_CATALOG.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className={`${item.colSpan}`}
          >
            <MagicCard
              onClick={() => setSelectedRenderIndex(idx)}
              className={`group relative overflow-hidden h-full flex flex-col justify-between cursor-pointer border-stone-200 dark:border-stone-800 ${item.height}`}
            >
              {/* Background Render Image */}
              <div className="absolute inset-0 z-0 bg-stone-950">
                <OptimizedMedia
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-stone-950/20 group-hover:opacity-90 transition-opacity" />
              </div>

              {/* Card Top Header */}
              <div className="relative z-10 p-5 flex justify-between items-start">
                <span className="bg-stone-900/85 backdrop-blur-md text-gold text-[10px] font-extrabold px-3 py-1.5 rounded-full border border-gold/30 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles size={11} /> {item.category}
                </span>
                <span className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md transition-all border border-white/20 opacity-0 group-hover:opacity-100">
                  <Maximize2 size={14} />
                </span>
              </div>

              {/* Card Bottom Description */}
              <div className="relative z-10 p-5 space-y-1.5 text-left">
                <h3 className="text-lg md:text-xl font-bold text-white leading-snug font-sans group-hover:text-gold transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-[11px] font-extrabold text-gold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  <Eye size={12} /> Ver Render en Detalle
                </div>
              </div>
            </MagicCard>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal for 3D Renders */}
      <AnimatePresence>
        {selectedRenderIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-8"
            onClick={() => setSelectedRenderIndex(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedRenderIndex(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md border border-white/20 transition-all z-[60] cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X size={24} />
            </button>

            {/* Main Render Image Display */}
            <div
              className="relative w-full max-w-5xl h-full max-h-[85vh] flex flex-col items-center justify-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedRenderIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex flex-col items-center justify-center"
                >
                  <div className="relative rounded-3xl overflow-hidden border border-stone-700 shadow-2xl max-h-[70vh] bg-stone-950">
                    <OptimizedMedia
                      src={RENDERS_CATALOG[selectedRenderIndex].image}
                      alt={RENDERS_CATALOG[selectedRenderIndex].title}
                      className="max-w-full max-h-[70vh] object-contain"
                    />
                  </div>

                  <div className="text-center space-y-1 mt-4 max-w-xl">
                    <span className="text-[10px] font-extrabold text-gold uppercase tracking-widest bg-gold/10 px-3 py-1 rounded-full border border-gold/20 inline-block mb-1">
                      {RENDERS_CATALOG[selectedRenderIndex].category}
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-white">
                      {RENDERS_CATALOG[selectedRenderIndex].title}
                    </h3>
                    <p className="text-xs md:text-sm text-stone-300">
                      {RENDERS_CATALOG[selectedRenderIndex].description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md border border-white/20 transition-all z-[60] cursor-pointer"
              aria-label="Render anterior"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md border border-white/20 transition-all z-[60] cursor-pointer"
              aria-label="Siguiente render"
            >
              <ChevronRight size={28} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
