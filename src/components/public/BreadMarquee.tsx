import React from 'react';
import { BREADS_CATALOG } from '../../data/breadsData';
import OptimizedMedia from '../common/OptimizedMedia';
import { Sparkles } from 'lucide-react';

export const BreadMarquee: React.FC = () => {
  // Multiply list for continuous looping animation
  const marqueeItems = [...BREADS_CATALOG, ...BREADS_CATALOG];

  return (
    <section className="w-full py-8 overflow-hidden bg-stone-900 dark:bg-stone-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 mb-4 text-center">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-gold uppercase tracking-widest bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
          <Sparkles size={12} className="animate-pulse" />
          Hornea Diaria en Formato Vertical 3:4
        </span>
      </div>

      <div className="flex w-full overflow-hidden select-none group">
        <div className="flex gap-6 animate-marquee shrink-0 items-center">
          {marqueeItems.map((bread, idx) => (
            <div
              key={`${bread.id}-${idx}`}
              className="relative shrink-0 w-36 sm:w-44 aspect-[3/4] rounded-2xl overflow-hidden border border-gold/30 shadow-lg group/item cursor-pointer"
            >
              <OptimizedMedia
                src={bread.image}
                alt={bread.name}
                className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 text-left">
                <span className="text-[9px] font-black text-gold uppercase tracking-wider block">
                  {bread.badge || bread.fermentation}
                </span>
                <p className="text-xs font-bold text-white leading-tight truncate">
                  {bread.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
