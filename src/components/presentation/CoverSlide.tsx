import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import logoRose from '../../assets/logo rose coffee/1 rose coffee.svg';

interface CoverSlideProps {
  title: string;
  subtitle: string;
  author: string;
  backgroundImage?: string;
}

export const CoverSlide: React.FC<CoverSlideProps> = ({ title, subtitle, author, backgroundImage }) => {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 250]);

  return (
    <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden pt-32 pb-16 md:py-24 w-full bg-primary">
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.15, filter: 'blur(4px)' }}
            animate={{ scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            style={{ y: heroY }}
            src={backgroundImage}
            alt="Fondo de la portada"
            className="w-full h-[120%] object-cover object-center origin-center will-change-transform opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/60 to-primary pointer-events-none" />
        </div>
      )}
      
      <motion.div 
        initial="initial"
        animate="animate"
        variants={{
          initial: { opacity: 0 },
          animate: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
        }}
        className="relative z-10 max-w-4xl mx-auto px-6 w-full flex flex-col items-center text-center space-y-8"
      >
        <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }} className="w-32 h-32 md:w-40 md:h-40 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center p-6 border border-white/20 shadow-2xl">
           <img src={logoRose} alt="Rose Coffee" className="w-full h-full object-contain filter drop-shadow-lg" />
        </motion.div>
        
        <div className="space-y-4">
          <motion.h1 variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }} className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-brand-base">
            {title}
          </motion.h1>
          <motion.p variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }} className="text-xl md:text-2xl text-gold font-medium">
            {subtitle}
          </motion.p>
        </div>
        
        <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }} className="pt-12 text-sm text-stone-300 flex flex-col items-center gap-1">
          <span className="uppercase tracking-widest text-xs font-bold text-stone-400">Presentado por</span>
          <span className="text-lg text-brand-base">{author}</span>
        </motion.div>
      </motion.div>
    </section>
  );
};
