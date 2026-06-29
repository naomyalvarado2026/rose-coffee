import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, X } from 'lucide-react';
import OptimizedMedia from '../common/OptimizedMedia';

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

const LOCAL_GALLERY: GalleryImage[] = [
  { id: '1', url: '/fotos/Foto Naomy haciendo masa Madre.webp', caption: 'Naomy preparando masa madre' },
  { id: '2', url: '/fotos/Harina de masa madre.webp', caption: 'Harina e ingredientes de calidad' },
  { id: '3', url: '/fotos/Masa Madre.webp', caption: 'Nuestra masa madre' },
  { id: '4', url: '/fotos/Naomy amasando 2.webp', caption: 'Proceso artesanal' },
  { id: '5', url: '/fotos/Naomy amasando.webp', caption: 'Amasado tradicional' },
  { id: '6', url: '/fotos/Pan de masa madre plano cenital.webp', caption: 'Pan de masa madre' },
  { id: '7', url: '/fotos/Pan de masa madre plano entero.webp', caption: 'Pan recién horneado' },
  { id: '8', url: '/fotos/Video de amasando la masa madre.mp4', caption: 'El arte del amasado' },
  { id: '9', url: '/fotos/gatita mirando un pan de masa madre.webp', caption: 'Nuestra asistente felina' },
  { id: '10', url: '/fotos/pan de masa madre y una gatita.webp', caption: 'El pan favorito de todos' }
];

export const ImageGallerySection = ({ 
  title, 
  subtitle, 
  slides 
}: ImageGallerySectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // If the slides contain Unsplash URLs (default seed), override with our local gallery
  const hasUnsplash = slides?.some(s => s.url.includes('unsplash.com'));
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
  }, [activeSlides?.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides?.length]);

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

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-8 animate-fadeIn">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        {title && <h2 className="text-3xl md:text-4xl font-sans font-bold text-primary dark:text-gold">{title}</h2>}
        {subtitle && <p className="text-gray-500 dark:text-stone-400 text-sm md:text-base leading-relaxed">{subtitle}</p>}
      </div>

      <div className="relative w-full h-[50vh] md:h-[65vh] rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-stone-700 group bg-slate-950">
        {/* Slides */}
        <div className="absolute inset-0 w-full h-full">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full cursor-zoom-in"
              onClick={() => setIsLightboxOpen(true)}
            >
              <OptimizedMedia
                src={activeSlides[currentIndex].url}
                alt={activeSlides[currentIndex].caption || "Galería"}
                className="w-full h-full object-cover select-none"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Caption */}
        {activeSlides[currentIndex].caption && (
          <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 z-10 text-left max-w-xl">
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white text-base md:text-xl font-sans font-bold drop-shadow-md"
            >
              {activeSlides[currentIndex].caption}
            </motion.p>
          </div>
        )}

        {/* Navigation Arrows */}
        {activeSlides.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-stone-800/10 hover:bg-white dark:bg-stone-800/20 text-white p-3 rounded-full backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 border border-white/15 z-10 cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-stone-800/10 hover:bg-white dark:bg-stone-800/20 text-white p-3 rounded-full backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 border border-white/15 z-10 cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Controls Overlay */}
        <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-10 flex items-center gap-3">
          {activeSlides.length > 1 && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-white dark:bg-stone-800/10 hover:bg-white dark:bg-stone-800/20 text-white p-2 rounded-xl backdrop-blur-xs border border-white/15 transition-all cursor-pointer"
              title={isPlaying ? "Pausar carrusel" : "Reproducir carrusel"}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
            </button>
          )}

          {/* Dots Indicator */}
          {activeSlides.length > 1 && (
            <div className="flex gap-1.5 p-2 bg-black/35 rounded-full backdrop-blur-xs border border-white/5">
              {activeSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx ? 'w-5 bg-gold shadow-xs' : 'w-1.5 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2 bg-black/20 hover:bg-black/50 rounded-full backdrop-blur-md transition-all z-[60] cursor-pointer"
            >
              <X size={28} />
            </button>

            {/* Main Image */}
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
                    src={activeSlides[currentIndex].url}
                    alt={activeSlides[currentIndex].caption || "Galería"}
                    className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl"
                  />
                  {activeSlides[currentIndex].caption && (
                    <p className="text-white/90 text-lg md:text-xl font-sans mt-6 text-center max-w-2xl">
                      {activeSlides[currentIndex].caption}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            {activeSlides.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-4 bg-black/20 hover:bg-black/50 rounded-full backdrop-blur-md transition-all z-[60] cursor-pointer"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-4 bg-black/20 hover:bg-black/50 rounded-full backdrop-blur-md transition-all z-[60] cursor-pointer"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
