import { motion } from 'framer-motion';

export default function MarqueeText() {
  const phrase = "✦ CAFÉ DE ESPECIALIDAD ✦ PAN DE MASA MADRE ✦ HORNEADO CON AMOR ";
  const repeatedPhrase = Array(6).fill(phrase).join('');

  return (
    <div className="w-full bg-[#021a54] overflow-hidden py-3.5 sm:py-4.5 border-y border-gold/20 select-none relative z-10 flex">
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: 35,
        }}
        className="flex whitespace-nowrap text-xs sm:text-sm font-sans font-black tracking-widest text-[#faf2e7] uppercase"
      >
        <span className="inline-block pr-8">{repeatedPhrase}</span>
        <span className="inline-block pr-8">{repeatedPhrase}</span>
      </motion.div>
    </div>
  );
}
