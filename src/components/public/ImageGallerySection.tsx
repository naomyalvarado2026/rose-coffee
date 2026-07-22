import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, X, Maximize2, Sparkles, Wheat } from 'lucide-react';
import OptimizedMedia from '../common/OptimizedMedia';
import { BorderBeam } from '../ui/magic/BorderBeam';
import { MagicCard } from '../ui/magic/MagicCard';

interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
}

interface ImageGallerySectionProps {
  title: string;
  subtitle: string;
  slides: GalleryImage[];
}

// Curated high quality gallery images without cropped videos or distorted cuts
const LOCAL_GALLERY: GalleryImage[] = [
  { id: '1', url: '/fotos/Foto Naomy haciendo masa Madre.webp', caption: 'Naomy preparando la masa madre en el taller' },
  { id: '2', url: '/fotos/Harina de masa madre.webp', caption: 'Selección de harinas orgánicas de piedra' },
  { id: '3', url: '/fotos/Masa Madre.webp', caption: 'Fermentación viva y salvaje de 24 horas' },
  { id: '4', url: '/fotos/Naomy amasando.webp', caption: 'Proceso de amasado artesanal a mano' },
  { id: '5', url: '/fotos/Pan de masa madre plano cenital.webp', caption: 'Hogaza recién horneada - Vista cenital' },
  { id: '6', url: '/fotos/Pan de masa madre plano entero.webp', caption: 'Corteza crujiente y greñado de autor' },
  { id: '7', url: '/fotos/gatita mirando un pan de masa madre.webp', caption: 'Nuestra icónica mascota Rose Coffee' },
  { id: '8', url: '/fotos/pan de masa madre y una gatita.webp', caption: 'Pasión por el detalle en cada horneada' }
];

export const ImageGallerySection = ({ 
  title, 
  subtitle, 
  slides 
}: ImageGallerySectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // If the slides contain Unsplash URLs or are empty, use clean LOCAL_GALLERY
  const hasUnsplash = slides?.some(s => s.url.includes('unsplash.com') || s.url.includes('.mp4'));
  const activeSlides = hasUnsplash || !slides || slides.length === 0 ? LOCAL_GALLERY : slides;

  useEffect(() => {
    if (!isPlaying || isLightboxOpen || !activeSlides || activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, isLightboxOpen, activeSlides]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handlePrev, handleNext]);

  if (!activeSlides || activeSlides.length === 0) return null;

  const currentSlide = activeSlides[currentIndex];

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-8 animate-fadeIn text-left py-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-coffee dark:text-gold uppercase tracking-widest bg-coffee/5 px-3.5 py-1.5 rounded-full border border-coffee/20">
          <Wheat size={13} className="text-gold" />
          <span>Galería de Proceso & Momentos</span>
        </div>
        {title && <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-stone-100 font-sans tracking-tight">{title}</h2>}
        {subtitle && <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">{subtitle}</p>}
      </div>

      {/* Main Adaptive Showcase Container with Magic UI BorderBeam */}
      <div className="relative w-full h-[55vh] md:h-[65vh] rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 group bg-stone-950 flex items-center justify-center">
        
        {/* Animated Magic UI Border Beam on Active Gallery Frame */}
        <BorderBeam size={300} duration={10} colorFrom="#C5A059" colorTo="#E6C875" />

        {/* Ambient Blurred Background to accommodate both vertical and horizontal photos cleanly */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`bg-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <OptimizedMedia
              src={currentSlide.url}
              alt=""
              className="w-full h-full object-cover blur-2xl scale-125"
            />
          </motion.div>
        </AnimatePresence>

        {/* Main Foreground Image - Uses object-contain so vertical/horizontal photos fit 100% without ugly crops */}
        <div className="relative z-10 w-full h-full flex items-center justify-center p-4 md:p-8 cursor-zoom-in" onClick={() => setIsLightboxOpen(true)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full h-full flex items-center justify-center relative max-h-full"
            >
              <OptimizedMedia
                src={currentSlide.url}
                alt={currentSlide.caption || title}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10 select-none"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Caption Overlay */}
        {currentSlide.caption && (
          <div className="absolute bottom-6 left-6 right-20 md:bottom-8 md:left-8 z-20 text-left max-w-xl">
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-stone-950/75 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 inline-block shadow-lg"
            >
              <p className="text-white text-xs md:text-sm font-bold font-sans flex items-center gap-2">
                <Sparkles size={14} className="text-gold shrink-0" />
                {currentSlide.caption}
              </p>
            </motion.div>
          </div>
        )}

        {/* Navigation Arrows */}
        {activeSlides.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-stone-900/60 hover:bg-stone-900/90 text-white p-3 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 border border-white/20 z-20 cursor-pointer"
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-stone-900/60 hover:bg-stone-900/90 text-white p-3 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 border border-white/20 z-20 cursor-pointer"
              aria-label="Siguiente imagen"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Controls Bar (Autoplay & Lightbox Expand) */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="bg-stone-900/70 hover:bg-stone-900 text-white p-2.5 rounded-xl backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md"
            title="Ver en pantalla completa"
          >
            <Maximize2 size={16} />
          </button>
          {activeSlides.length > 1 && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-stone-900/70 hover:bg-stone-900 text-white p-2.5 rounded-xl backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md"
              title={isPlaying ? "Pausar carrusel" : "Reproducir carrusel"}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} className="fill-current" />}
            </button>
          )}
        </div>
      </div>

      {/* Magic UI Interactive Thumbnail Strip */}
      <div className="w-full flex gap-3 overflow-x-auto pb-2 scrollbar-none pt-2">
        {activeSlides.map((slide, idx) => {
          const isSelected = currentIndex === idx;
          return (
            <MagicCard
              key={slide.id}
              onClick={() => {
                setCurrentIndex(idx);
                setIsPlaying(false);
              }}
              className={`shrink-0 w-24 sm:w-28 h-20 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                isSelected
                  ? 'border-gold shadow-lg scale-105 ring-2 ring-gold/40'
                  : 'opacity-50 hover:opacity-100 border-stone-200 dark:border-stone-800'
              }`}
            >
              <div className="relative w-full h-full">
                <OptimizedMedia
                  src={slide.url}
                  alt={slide.caption || ''}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 ${isSelected ? 'bg-transparent' : 'bg-black/30'}`} />
              </div>
            </MagicCard>
          );
        })}
      </div>

      {/* Lightbox Modal */}
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
              <X size={26} />
            </button>

            <div 
              className="relative w-full h-full max-w-6xl max-h-screen p-4 md:p-12 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex flex-col items-center justify-center"
                >
                  <OptimizedMedia
                    src={currentSlide.url}
                    alt={currentSlide.caption || "Galería"}
                    className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                  />
                  {currentSlide.caption && (
                    <p className="text-white/90 text-sm md:text-base font-sans mt-4 text-center max-w-xl bg-stone-900/80 px-4 py-2 rounded-xl border border-white/10">
                      {currentSlide.caption}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Lightbox Navigation Arrows */}
            {activeSlides.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3.5 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all z-[60] cursor-pointer border border-white/20"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="absolute right-4 md:left-auto md:right-10 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3.5 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all z-[60] cursor-pointer border border-white/20"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
