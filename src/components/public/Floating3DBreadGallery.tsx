import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BREADS_CATALOG } from '../../data/breadsData';
import OptimizedMedia from '../common/OptimizedMedia';
import { BorderBeam } from '../ui/magic/BorderBeam';
import { ChevronLeft, ChevronRight, Maximize2, Sparkles, Wheat, X } from 'lucide-react';

export const Floating3DBreadGallery: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const showcaseBreads = BREADS_CATALOG;
  const currentBread = showcaseBreads[currentIndex];

  const handleNext = useCallback(() => {
    if (isFlipping) return;
    setIsFlipping(true);
    setCurrentIndex((prev) => (prev + 1) % showcaseBreads.length);
    setTimeout(() => setIsFlipping(false), 500);
  }, [isFlipping, showcaseBreads.length]);

  const handlePrev = useCallback(() => {
    if (isFlipping) return;
    setIsFlipping(true);
    setCurrentIndex((prev) => (prev - 1 + showcaseBreads.length) % showcaseBreads.length);
    setTimeout(() => setIsFlipping(false), 500);
  }, [isFlipping, showcaseBreads.length]);

  // Autoplay subtle 3D rotation
  useEffect(() => {
    if (isHovered || isLightboxOpen) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5500);
    return () => clearInterval(interval);
  }, [isHovered, isLightboxOpen, handleNext]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
      {/* Glow Ambient Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-tr from-gold/20 via-coffee/10 to-transparent blur-3xl rounded-3xl pointer-events-none" />

      {/* Main 3D Card Container with Perspective */}
      <div
        className="relative w-full max-w-md aspect-[4/5] [perspective:1200px] group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Stack Cards Effect for 3D Layering */}
        <div className="absolute inset-0 rounded-3xl bg-stone-900/60 border border-stone-700/50 [transform:translateZ(-40px)_rotateY(-12deg)_rotateX(6deg)] transition-transform duration-500 group-hover:[transform:translateZ(-50px)_rotateY(-16deg)_rotateX(8deg)] pointer-events-none" />
        <div className="absolute inset-0 rounded-3xl bg-stone-900/80 border border-gold/30 [transform:translateZ(-20px)_rotateY(-6deg)_rotateX(3deg)] transition-transform duration-500 group-hover:[transform:translateZ(-25px)_rotateY(-8deg)_rotateX(4deg)] pointer-events-none" />

        {/* Foreground 3D Rotating Active Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBread.id}
            initial={{ opacity: 0, rotateY: 90, scale: 0.9 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: -90, scale: 0.9 }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
            whileHover={{
              rotateY: 8,
              rotateX: -6,
              scale: 1.03,
              transition: { duration: 0.3 },
            }}
            onClick={() => setIsLightboxOpen(true)}
            className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-700 bg-stone-950 flex flex-col justify-between"
          >
            {/* Border Beam Animation */}
            <BorderBeam size={280} duration={8} colorFrom="#C5A059" colorTo="#E6C875" />

            {/* High Res Bread Image */}
            <div className="absolute inset-0 z-0">
              <OptimizedMedia
                src={currentBread.image}
                alt={currentBread.name}
                className="w-full h-full object-cover select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/25 to-stone-950/20" />
            </div>

            {/* Top Bar Badges */}
            <div className="relative z-10 p-4 flex justify-between items-center">
              <span className="bg-stone-950/80 backdrop-blur-md text-gold text-[10px] font-extrabold px-3 py-1.5 rounded-full border border-gold/30 uppercase tracking-widest flex items-center gap-1.5">
                <Wheat size={12} /> {currentBread.number} / 08
              </span>
              <span className="bg-gold text-stone-950 text-[10px] font-black px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider">
                {currentBread.badge || 'Masa Madre'}
              </span>
            </div>

            {/* Bottom Info Overlay */}
            <div className="relative z-10 p-5 text-left space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold block">
                {currentBread.subtitle}
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-white leading-tight font-sans drop-shadow-md">
                {currentBread.name}
              </h3>
              <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed pt-1">
                {currentBread.description}
              </p>

              {/* Action Hint */}
              <div className="pt-2 flex justify-between items-center text-[10px] text-stone-300 font-semibold">
                <span className="flex items-center gap-1 text-gold">
                  <Sparkles size={12} /> Rotación 3D Activa
                </span>
                <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
                  <Maximize2 size={11} /> Pantalla Completa
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 3D Navigation Arrow Overlay Controls */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 bg-stone-950/70 hover:bg-stone-950 rounded-full backdrop-blur-md border border-white/20 transition-all z-20 cursor-pointer shadow-lg hover:scale-110"
          aria-label="Pan anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 bg-stone-950/70 hover:bg-stone-950 rounded-full backdrop-blur-md border border-white/20 transition-all z-20 cursor-pointer shadow-lg hover:scale-110"
          aria-label="Siguiente pan"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Lightbox Modal for HD Inspection */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 text-white/70 hover:text-white p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md border border-white/20 transition-all z-[60] cursor-pointer"
            >
              <X size={24} />
            </button>

            <motion.div
              initial={{ scale: 0.9, rotateY: 45 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0.9, rotateY: -45 }}
              transition={{ duration: 0.4 }}
              className="relative max-w-3xl max-h-[85vh] p-4 flex flex-col items-center justify-center space-y-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative rounded-3xl overflow-hidden border border-stone-700 shadow-2xl bg-stone-950 max-h-[70vh]">
                <OptimizedMedia
                  src={currentBread.image}
                  alt={currentBread.name}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-gold uppercase tracking-widest bg-gold/10 px-3 py-1 rounded-full border border-gold/20 inline-block">
                  {currentBread.subtitle}
                </span>
                <h3 className="text-2xl font-bold text-white">{currentBread.name}</h3>
                <p className="text-xs md:text-sm text-stone-300 max-w-md mx-auto">
                  {currentBread.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
