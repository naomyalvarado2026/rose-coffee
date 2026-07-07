import React from 'react';
import { motion } from 'framer-motion';
import logoRose from '../../assets/logo rose coffee/1 rose coffee.svg';

interface LogoShowcaseProps {
  description?: string;
  visibleVariants?: number[];
}

export const LogoShowcase: React.FC<LogoShowcaseProps> = ({ 
  description = "Nuestro imagotipo combina la tipografía clásica con un isotipo floral que hace referencia al nombre 'Rose'. Las diferentes variaciones permiten adaptabilidad en múltiples formatos físicos y digitales manteniendo el reconocimiento visual.",
  visibleVariants
}) => {
  // Use Vite's import.meta.glob to dynamically load all SVGs in the folder
  const logoImports = import.meta.glob<{ default: string }>('../../assets/logo rose coffee/*.svg', { eager: true, query: '?url' });
  
  // Convert into an array and sort by number
  const allLogos = Object.entries(logoImports).map(([path, module]) => {
    // Extract the number from "X rose coffee.svg"
    const match = path.match(/(\d+)\s+rose\s+coffee\.svg$/);
    const num = match ? parseInt(match[1], 10) : 0;
    return {
      id: num,
      url: module.default,
      path
    };
  }).sort((a, b) => a.id - b.id);

  // Filter if visibleVariants is provided
  const displayLogos = visibleVariants && visibleVariants.length > 0 
    ? allLogos.filter(logo => visibleVariants.includes(logo.id))
    : allLogos;

  return (
    <section className="py-24 bg-white dark:bg-stone-900 w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <span className="inline-block text-[10px] font-bold text-coffee dark:text-gold uppercase tracking-widest border border-coffee/25 bg-coffee/5 px-4 py-1.5 rounded-full mb-4">
            Identidad Visual
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-primary dark:text-stone-100 mb-6">
            Logotipo y Variaciones
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-lg leading-relaxed">
            {description}
          </p>
        </div>

        {/* Main Logo Showcase */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-primary dark:bg-stone-950 rounded-[40px] border border-primary/20 dark:border-stone-800 p-12 md:p-24 flex items-center justify-center mb-16 shadow-inner relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" />
          <img 
            src={logoRose} 
            alt="Rose Coffee Main Logo" 
            className="w-full max-w-md object-contain filter drop-shadow-xl z-10"
          />
        </motion.div>

        {/* Grid of Variants */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-primary dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-4">
            Sistema de Variaciones ({displayLogos.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {displayLogos.map((logo, index) => (
              <motion.div
                key={logo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (index % 7) * 0.05 }}
                className="checkerboard rounded-2xl p-4 aspect-square flex items-center justify-center border border-stone-200 dark:border-stone-700 hover:border-primary dark:hover:border-gold hover:shadow-md transition-all group relative cursor-pointer overflow-hidden"
              >
                <span className="absolute top-2 left-2 text-[8px] font-bold text-stone-400 dark:text-stone-500 z-10 bg-white/50 dark:bg-black/50 px-1 rounded backdrop-blur-sm">
                  #{logo.id}
                </span>
                <img 
                  src={logo.url} 
                  alt={`Variación ${logo.id}`} 
                  className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
