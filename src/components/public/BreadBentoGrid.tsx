import React from 'react';
import { motion } from 'framer-motion';
import { BREADS_CATALOG } from '../../data/breadsData';
import { MagicCard } from '../ui/magic/MagicCard';
import OptimizedMedia from '../common/OptimizedMedia';
import { Sparkles, ArrowRight, Wheat, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BreadBentoGrid: React.FC = () => {
  // Select 4 showcase breads for Bento layout
  const bentoItems = [
    { bread: BREADS_CATALOG[0], colSpan: 'lg:col-span-2 lg:row-span-2', height: 'h-full min-h-[380px]' },
    { bread: BREADS_CATALOG[1], colSpan: 'lg:col-span-1 lg:row-span-1', height: 'h-64' },
    { bread: BREADS_CATALOG[4], colSpan: 'lg:col-span-1 lg:row-span-1', height: 'h-64' },
    { bread: BREADS_CATALOG[5], colSpan: 'lg:col-span-2 lg:row-span-1', height: 'h-64' },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 text-left">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-coffee dark:text-gold uppercase tracking-widest bg-coffee/5 px-3 py-1 rounded-full border border-coffee/20">
            <Sparkles size={12} />
            Mosaico de Panadería Artesanal
          </span>
          <h2 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            Nuestros Especiales de Masa Madre
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm">
            Horneados diariamente a alta temperatura con levadura salvaje viva.
          </p>
        </div>
        <Link
          to="/tienda"
          className="text-coffee dark:text-gold hover:underline font-extrabold text-xs uppercase tracking-wider flex items-center gap-1 shrink-0"
        >
          Ver todo el catálogo <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 auto-rows-fr">
        {bentoItems.map((item, idx) => (
          <motion.div
            key={item.bread.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className={`${item.colSpan}`}
          >
            <MagicCard className={`group relative overflow-hidden h-full flex flex-col justify-between ${item.height}`}>
              {/* Background 3:4 Aspect Image */}
              <div className="absolute inset-0 z-0">
                <OptimizedMedia
                  src={item.bread.image}
                  alt={item.bread.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-stone-950/20" />
              </div>

              {/* Card Top Header */}
              <div className="relative z-10 p-5 flex justify-between items-start">
                <span className="bg-stone-900/80 backdrop-blur-md text-gold text-[10px] font-extrabold px-3 py-1 rounded-full border border-gold/30 uppercase tracking-widest">
                  {item.bread.badge || 'Masa Madre'}
                </span>
                <span className="bg-gold text-stone-950 text-xs font-black px-3 py-1 rounded-full shadow-sm">
                  ${item.bread.price.toFixed(2)}
                </span>
              </div>

              {/* Card Bottom Description */}
              <div className="relative z-10 p-5 space-y-2 text-left">
                <div className="flex items-center gap-3 text-gold text-[10px] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {item.bread.fermentation}
                  </span>
                  <span className="flex items-center gap-1">
                    <Wheat size={12} /> {item.bread.hydration}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white leading-tight font-sans">
                  {item.bread.name}
                </h3>
                <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                  {item.bread.description}
                </p>
                <div className="pt-2">
                  <Link
                    to="/tienda"
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-gold hover:text-white transition-colors"
                  >
                    Detalles del Pan <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </MagicCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
