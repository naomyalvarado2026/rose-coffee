import React, { useRef, useState } from 'react';
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
  const opacityText = useTransform(scrollY, [0, 400], [1, 0]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const words = title ? title.split(' ') : [];

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="cover-slide-print relative min-h-screen flex items-center justify-center text-white overflow-hidden pt-32 pb-16 md:py-24 w-full bg-primary"
    >
      {/* Interactive Glow */}
      <div 
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 opacity-60 mix-blend-screen"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(200, 146, 42, 0.15), transparent 40%)`
        }}
      />

      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.15, filter: 'blur(10px)' }}
            animate={{ scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            style={{ y: heroY }}
            src={backgroundImage}
            alt="Fondo de la portada"
            className="w-full h-[120%] object-cover object-center origin-center will-change-transform opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/95 via-primary/70 to-primary pointer-events-none" />
        </div>
      )}
      
      <motion.div 
        initial="initial"
        animate="animate"
        style={{ opacity: opacityText, y: heroY }}
        variants={{
          initial: { opacity: 0 },
          animate: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
        }}
        className="relative z-20 max-w-5xl mx-auto px-6 w-full flex flex-col items-center text-center space-y-10"
      >
        <motion.div 
          variants={{ initial: { opacity: 0, scale: 0.5, rotate: -10 }, animate: { opacity: 1, scale: 1, rotate: 0 } }} 
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          whileHover={{ scale: 1.05, rotate: 5, boxShadow: "0px 0px 40px rgba(200, 146, 42, 0.25)" }}
          className="w-36 h-36 md:w-44 md:h-44 bg-white/5 backdrop-blur-md rounded-[40px] flex items-center justify-center p-8 border border-white/10 shadow-2xl cursor-pointer transition-all duration-300 group"
        >
           <motion.img 
             animate={{ y: [0, -8, 0] }} 
             transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
             src={logoRose} 
             alt="Rose Coffee" 
             className="w-full h-full object-contain filter drop-shadow-xl group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all" 
           />
        </motion.div>
        
        <div className="space-y-8 max-w-4xl">
          <h1 className="text-4xl md:text-6xl lg:text-[4.5rem] font-black tracking-tight text-stone-50 leading-[1.1] flex flex-wrap justify-center gap-x-4 gap-y-2 drop-shadow-sm">
            {words.map((word, i) => (
              <motion.span 
                key={i}
                variants={{
                  initial: { opacity: 0, y: 40, rotateX: 90 },
                  animate: { opacity: 1, y: 0, rotateX: 0 }
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h1>
          
          <motion.div 
            variants={{ initial: { opacity: 0, scale: 0 }, animate: { opacity: 1, scale: 1 } }}
            className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto rounded-full opacity-70"
          />
          
          <motion.p 
            variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }} 
            className="text-xl md:text-2xl lg:text-3xl text-gold font-medium tracking-wide drop-shadow-md"
          >
            {subtitle}
          </motion.p>
        </div>
        
        <motion.div 
          variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }} 
          className="pt-16 flex flex-col items-center gap-2"
        >
          <span className="uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold text-stone-400/80">Presentado por</span>
          <span className="text-xl md:text-2xl text-stone-100 font-semibold tracking-wide">{author}</span>
        </motion.div>
      </motion.div>
    </section>
  );
};
