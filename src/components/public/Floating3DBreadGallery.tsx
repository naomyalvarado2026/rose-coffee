import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BREADS_CATALOG } from '../../data/breadsData';
import OptimizedMedia from '../common/OptimizedMedia';
import { Sparkles, Maximize2, X, Wheat } from 'lucide-react';

export const Floating3DBreadGallery: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const showcaseBreads = BREADS_CATALOG.slice(0, 5); // 5 panes principales

  return (
    <div className="relative w-full py-6 flex flex-col items-center justify-center">
      {/* Decorative 3D Glow ambient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-tr from-gold/20 via-coffee/10 to-transparent blur-2xl rounded-full pointer-events-none" />

      {/* 3D Floating Interactive Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-4 w-full max-w-lg perspective-1000">
        {showcaseBreads.map((bread, index) => {
          const isMain = index === 0;
          return (
            <motion.div
              key={bread.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              animate={{
                y: [0, index % 2 === 0 ? -6 : 6, 0],
              }}
              /* Continuous subtle floating animation */
              style={{
                animationDuration: `${4 + index}s`,
              }}
              whileHover={{
                scale: 1.06,
                rotateX: index % 2 === 0 ? 5 : -5,
                rotateY: index % 2 === 0 ? -5 : 5,
                z: 40,
                transition: { duration: 0.3, ease: 'easeOut' },
              }}
              onClick={() => setActiveIndex(index)}
              className={`relative group cursor-pointer rounded-2xl overflow-hidden shadow-xl border border-stone-200/80 dark:border-stone-700/80 bg-stone-900 ${
                isMain ? 'col-span-2 aspect-[16/10]' : 'col-span-1 aspect-[3/4]'
              }`}
            >
              {/* High Res Bread Image */}
              <OptimizedMedia
                src={bread.image}
                alt={bread.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent group-hover:from-stone-950/95 transition-all" />

              {/* Top Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-stone-900/80 backdrop-blur-md text-gold text-[9px] font-extrabold px-2.5 py-1 rounded-full border border-gold/30">
                <Wheat size={10} />
                <span>{bread.badge || 'Masa Madre'}</span>
              </div>

              {/* Expand Icon on Hover */}
              <div className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 text-white p-1.5 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 size={13} />
              </div>

              {/* Bottom Details */}
              <div className="absolute bottom-3 left-3 right-3 text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gold/90">
                  {bread.subtitle}
                </p>
                <h4 className="text-xs sm:text-sm font-bold text-white leading-tight font-sans truncate">
                  {bread.name}
                </h4>
              </div>

              {/* 3D Border Glow on Hover */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gold/60 transition-colors pointer-events-none" />
            </motion.div>
          );
        })}
      </div>

      <p className="text-[11px] font-semibold text-stone-400 mt-4 flex items-center gap-1.5">
        <Sparkles size={12} className="text-gold animate-pulse" />
        Haz clic sobre cualquier pan para ampliar la foto en alta resolución
      </p>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
            onClick={() => setActiveIndex(null)}
          >
            <button
              onClick={() => setActiveIndex(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md border border-white/20 transition-all z-[60] cursor-pointer"
            >
              <X size={24} />
            </button>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-3xl max-h-[85vh] p-4 flex flex-col items-center justify-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative rounded-3xl overflow-hidden border border-stone-700 shadow-2xl bg-stone-950 max-h-[70vh]">
                <OptimizedMedia
                  src={showcaseBreads[activeIndex].image}
                  alt={showcaseBreads[activeIndex].name}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-white">
                  {showcaseBreads[activeIndex].name}
                </h3>
                <p className="text-xs text-stone-300 max-w-md">
                  {showcaseBreads[activeIndex].description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
