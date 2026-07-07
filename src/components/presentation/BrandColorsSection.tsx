import React from 'react';
import { motion } from 'framer-motion';

export interface BrandColor {
  hex: string;
  name: string;
  description: string;
}

interface BrandColorsSectionProps {
  colors?: BrandColor[];
}

const defaultColors: BrandColor[] = [
  { hex: '#021a54', name: 'Azul', description: 'Color primario, representa elegancia y profundidad.' },
  { hex: '#faf2e7', name: 'Blanquito', description: 'Color base que aporta pureza y calidez.' },
  { hex: '#c8922a', name: 'Oro Detalle', description: 'Acento premium que resalta la exclusividad y alta calidad.' },
  { hex: '#000000', name: 'Negro', description: 'Color sólido para acentos fuertes y alto contraste.' }
];

export const BrandColorsSection: React.FC<BrandColorsSectionProps> = ({ colors = defaultColors }) => {
  const displayColors = colors && colors.length > 0 ? colors : defaultColors;

  return (
    <section className="py-24 bg-white dark:bg-stone-900 w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <span className="inline-block text-[10px] font-bold text-coffee dark:text-gold uppercase tracking-widest border border-coffee/25 bg-coffee/5 px-4 py-1.5 rounded-full mb-4">
            Paleta Cromática
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-primary dark:text-stone-100 mb-6">
            Colores de Marca
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-lg">
            Nuestra paleta de colores refleja la esencia cálida, premium y artesanal de Rose Coffee, combinando la profundidad del café de especialidad con detalles de elegancia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayColors.map((color, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-stone-50 dark:bg-stone-800 rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-700 shadow-sm group hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
            >
              <div 
                className="h-48 w-full group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundColor: color.hex }}
              />
              <div className="p-6 relative bg-white dark:bg-stone-800">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-primary dark:text-stone-100">{color.name}</h3>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 bg-stone-100 dark:bg-stone-700 rounded-md text-stone-600 dark:text-stone-300 uppercase">
                    {color.hex}
                  </span>
                </div>
                <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                  {color.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
