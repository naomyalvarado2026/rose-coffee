import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUp, 
  ChevronDown, 
  Play, 
  Pause, 
  Coffee, 
  Clock, 
  Wheat, 
  Sparkles, 
  ShoppingBag, 
  Layers, 
  ArrowRight,
  Flame,
  Droplets
} from 'lucide-react';
import { BREADS_CATALOG, type BreadItem } from '../../data/breadsData';
import { MagicCard } from '../ui/magic/MagicCard';
import { ShimmerButton } from '../ui/magic/ShimmerButton';
import OptimizedMedia from '../common/OptimizedMedia';
import { Link } from 'react-router-dom';

export const VerticalBreadShowcase: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activeBread: BreadItem = BREADS_CATALOG[selectedIndex];

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % BREADS_CATALOG.length);
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + BREADS_CATALOG.length) % BREADS_CATALOG.length);
  }, []);

  // Autoplay
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [isPlaying, handleNext]);

  // Scroll thumbnail container locally without triggering window scroll
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        const container = scrollContainerRef.current;
        const targetScrollLeft = activeEl.offsetLeft - (container.clientWidth / 2) + (activeEl.clientWidth / 2);
        container.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 relative overflow-hidden">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 bg-coffee/10 dark:bg-gold/10 text-coffee dark:text-gold border border-coffee/20 dark:border-gold/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md">
          <Sparkles size={14} className="text-gold animate-pulse" />
          <span>Colección de Masa Madre Artesanal</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
          Nuestras Hogazas <span className="text-coffee dark:text-gold italic font-serif">Artesanales</span>
        </h2>
        <p className="text-stone-600 dark:text-stone-400 text-sm md:text-base leading-relaxed">
          Explora nuestra variedad de panes de masa madre horneados diariamente. Haz clic o desplázate para descubrir los ingredientes, el proceso de fermentación salvaje y su maridaje perfecto.
        </p>
      </div>

      {/* Main Grid: Left = Vertical Gallery | Right = Detailed Description Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN: VERTICAL GALLERY (5 columns on LG screens) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          
          {/* Main Active 3:4 Vertical Image Display */}
          <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-700 bg-stone-950 group">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeBread.id}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full h-full relative"
              >
                <OptimizedMedia
                  src={activeBread.image}
                  alt={activeBread.name}
                  className="w-full h-full object-cover select-none"
                />
                
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-transparent to-transparent pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                  <span className="bg-stone-900/80 backdrop-blur-md text-gold text-[10px] font-extrabold px-3 py-1.5 rounded-full border border-gold/30 tracking-wider uppercase">
                    {activeBread.number} / 08
                  </span>
                  {activeBread.badge && (
                    <span className="bg-gold text-stone-950 text-[10px] font-black px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider">
                      {activeBread.badge}
                    </span>
                  )}
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-4 left-4 right-4 z-10 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gold/90 block mb-1">
                    {activeBread.subtitle}
                  </span>
                  <h3 className="text-xl font-bold text-white leading-tight font-sans drop-shadow-md">
                    {activeBread.name}
                  </h3>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Play/Pause Autoplay Control */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md border border-white/20 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
              title={isPlaying ? 'Pausar carrusel' : 'Reproducir carrusel'}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
            </button>
          </div>

          {/* VERTICAL REEL / THUMBNAILS CAROUSEL BELOW MAIN IMAGE (OR SIDE BY SIDE) */}
          <div className="w-full max-w-sm mt-6 relative">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-extrabold text-stone-500 uppercase tracking-widest">
                Variedades de Pan ({selectedIndex + 1} de {BREADS_CATALOG.length})
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-coffee hover:text-white dark:hover:bg-gold dark:hover:text-stone-900 transition-colors text-stone-700 dark:text-stone-300 cursor-pointer"
                  aria-label="Anterior pan"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-coffee hover:text-white dark:hover:bg-gold dark:hover:text-stone-900 transition-colors text-stone-700 dark:text-stone-300 cursor-pointer"
                  aria-label="Siguiente pan"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>

            {/* Horizontal/Vertical Scrollable Strip of 3:4 Thumbnails */}
            <div
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x"
            >
              {BREADS_CATALOG.map((bread, index) => {
                const isSelected = selectedIndex === index;
                return (
                  <button
                    key={bread.id}
                    onClick={() => {
                      setSelectedIndex(index);
                      setIsPlaying(false);
                    }}
                    className={`relative shrink-0 w-20 aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all duration-300 snap-start cursor-pointer group ${
                      isSelected
                        ? 'border-gold shadow-lg scale-105 ring-2 ring-gold/40'
                        : 'border-stone-200 dark:border-stone-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <OptimizedMedia
                      src={bread.image}
                      alt={bread.name}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute inset-0 transition-opacity ${
                        isSelected ? 'bg-gradient-to-t from-stone-950/80 via-transparent' : 'bg-black/30 group-hover:bg-transparent'
                      }`}
                    />
                    <span className="absolute bottom-1 right-1 text-[9px] font-extrabold text-white bg-black/60 px-1.5 py-0.5 rounded-md">
                      {bread.number}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: DETAILED BREAD DESCRIPTION PANEL (7 columns on LG screens) */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBread.id}
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <MagicCard className="p-6 md:p-8 space-y-6 text-left border-stone-200 dark:border-stone-800 shadow-xl bg-white dark:bg-stone-900/90">
                
                {/* Header Tag & Title */}
                <div className="space-y-2 border-b border-stone-100 dark:border-stone-800/80 pb-6">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-coffee dark:text-gold uppercase tracking-widest bg-coffee/10 dark:bg-gold/10 px-3 py-1 rounded-full border border-coffee/20 dark:border-gold/30">
                      <Wheat size={14} />
                      Panadería Artesanal Rose Coffee
                    </span>
                    <span className="text-2xl font-black text-coffee dark:text-gold">
                      ${activeBread.price.toFixed(2)}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl md:text-4xl font-extrabold text-stone-900 dark:text-stone-100 font-sans tracking-tight">
                    {activeBread.name}
                  </h3>
                  <p className="text-xs md:text-sm font-semibold text-stone-400 dark:text-stone-400 uppercase tracking-widest">
                    {activeBread.subtitle}
                  </p>
                </div>

                {/* Gastronomic Description */}
                <p className="text-stone-600 dark:text-stone-300 text-sm md:text-base leading-relaxed">
                  {activeBread.description}
                </p>

                {/* Technical Specifications Grid (4 Cards) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                  <div className="bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-700/60 text-left">
                    <div className="flex items-center gap-1.5 text-coffee dark:text-gold mb-1">
                      <Clock size={15} />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Fermentación</span>
                    </div>
                    <p className="text-xs font-extrabold text-stone-800 dark:text-stone-200">
                      {activeBread.fermentation}
                    </p>
                  </div>

                  <div className="bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-700/60 text-left">
                    <div className="flex items-center gap-1.5 text-coffee dark:text-gold mb-1">
                      <Droplets size={15} />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Hidratación</span>
                    </div>
                    <p className="text-xs font-extrabold text-stone-800 dark:text-stone-200">
                      {activeBread.hydration}
                    </p>
                  </div>

                  <div className="bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-700/60 text-left">
                    <div className="flex items-center gap-1.5 text-coffee dark:text-gold mb-1">
                      <Wheat size={15} />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Miga</span>
                    </div>
                    <p className="text-xs font-extrabold text-stone-800 dark:text-stone-200 truncate">
                      {activeBread.crumbType}
                    </p>
                  </div>

                  <div className="bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-700/60 text-left">
                    <div className="flex items-center gap-1.5 text-coffee dark:text-gold mb-1">
                      <Flame size={15} />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Corteza</span>
                    </div>
                    <p className="text-xs font-extrabold text-stone-800 dark:text-stone-200 truncate">
                      {activeBread.crustType}
                    </p>
                  </div>
                </div>

                {/* Flavor Profile Pills */}
                <div className="pt-2 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block">
                    Notas de Sabor & Cata
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeBread.flavorNotes.map((note, idx) => (
                      <span
                        key={idx}
                        className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center gap-1.5 shadow-xs"
                      >
                        <Sparkles size={11} className="text-gold" />
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Coffee Pairing Recommendation Banner */}
                <div className="my-4 bg-gradient-to-r from-stone-900 to-stone-800 dark:from-stone-950 dark:to-stone-900 p-5 rounded-2xl border border-gold/30 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-wider">
                      <Coffee size={14} />
                      <span>Maridaje Recomendado con Café</span>
                    </div>
                    <p className="text-sm font-extrabold text-white">
                      {activeBread.pairing.coffeeName}
                    </p>
                    <p className="text-xs text-stone-300 leading-snug">
                      {activeBread.pairing.description}
                    </p>
                  </div>
                  <Link
                    to="/tienda"
                    className="shrink-0 bg-gold hover:bg-gold-dark text-stone-950 text-xs font-black px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer hover:scale-105"
                  >
                    Ver Café <ArrowRight size={13} />
                  </Link>
                </div>

                {/* Action Buttons with Magic UI ShimmerButton - Balanced Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-stone-100 dark:border-stone-800/80">
                  <Link to="/tienda" className="w-full">
                    <ShimmerButton className="w-full bg-coffee hover:bg-coffee-dark text-white font-bold py-3.5 px-4 text-xs rounded-2xl shadow-lg border border-coffee/30">
                      <ShoppingBag size={15} />
                      Pedir {activeBread.name} (${activeBread.price.toFixed(2)})
                    </ShimmerButton>
                  </Link>

                  <Link to="/ar" className="w-full">
                    <button className="w-full h-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold py-3.5 px-4 text-xs rounded-2xl border border-stone-300 dark:border-stone-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                      <Layers size={15} className="text-coffee dark:text-gold" />
                      Visualizar en AR 3D
                    </button>
                  </Link>
                </div>

              </MagicCard>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};
