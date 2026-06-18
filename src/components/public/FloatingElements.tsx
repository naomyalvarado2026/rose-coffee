import { motion } from 'framer-motion';
import { Coffee, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FloatingItem {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  type: 'bean' | 'sourdough' | 'coffee' | 'sparkle';
  rotation: number;
  drift: number;
}

export default function FloatingElements() {
  const [items, setItems] = useState<FloatingItem[]>([]);

  useEffect(() => {
    // Generate random items on client side only to prevent SSR mismatch
    const generated: FloatingItem[] = Array.from({ length: 25 }).map((_, i) => {
      const types: ('bean' | 'sourdough' | 'coffee' | 'sparkle')[] = [
        'bean', 'sourdough', 'coffee', 'sparkle'
      ];
      return {
        id: i,
        x: Math.random() * 90 + 5, // percentage
        y: Math.random() * 80 + 10, // percentage
        size: Math.random() * 24 + 18, // size in px (larger for visual impact)
        delay: Math.random() * 6, // seconds
        duration: Math.random() * 15 + 15, // seconds (slow and elegant)
        type: types[i % types.length],
        rotation: Math.random() * 360,
        drift: Math.random() * 60 - 30 // horizontal drift
      };
    });
    setItems(generated);
  }, []);

  // Coffee bean custom SVG path
  const CoffeeBeanIcon = ({ size }: { size: number }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className="text-coffee/40 dark:text-coffee/25"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16.93c-3.95-.49-7-3.85-7-7.93 0-.64.08-1.25.22-1.84 1.84.44 3.65 1.57 5.16 3.09 1.52 1.51 2.65 3.32 3.09 5.16-.59.14-1.2.22-1.84.22zm7.78-7.78c-1.51-1.52-3.32-2.65-5.16-3.09.59-.14 1.2-.22 1.84-.22 3.95.49 7 3.85 7 7.93 0 .64-.08 1.25-.22 1.84-1.84-.44-3.65-1.57-5.16-3.09z" />
    </svg>
  );

  // Sourdough bread custom SVG path
  const SourdoughIcon = ({ size }: { size: number }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className="text-amber-700/35 dark:text-amber-800/20"
    >
      <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61l1.42-1.42C5.54 15.02 5 13.58 5 12c0-3.86 3.14-7 7-7s7 3.14 7 7c0 1.58-.54 3.02-1.39 4.19l1.42 1.42C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9zm-5 9c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1zm10 0c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1zm-5 5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm-3-5c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1zm6 0c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1z" />
    </svg>
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ 
            x: `${item.x}%`, 
            y: '110%', 
            opacity: 0,
            rotate: item.rotation 
          }}
          animate={{ 
            y: '-10%', 
            x: [`${item.x}%`, `${item.x + item.drift}%`, `${item.x}%`],
            opacity: [0, 0.6, 0.6, 0], // higher visibility opacity curve
            rotate: item.rotation + 360
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            width: item.size,
            height: item.size,
          }}
        >
          {item.type === 'bean' && <CoffeeBeanIcon size={item.size} />}
          {item.type === 'sourdough' && <SourdoughIcon size={item.size} />}
          {item.type === 'coffee' && (
            <Coffee 
              size={item.size} 
              className="text-coffee/35 dark:text-coffee/20" 
            />
          )}
          {item.type === 'sparkle' && (
            <Sparkles 
              size={item.size - 4} 
              className="text-gold/45 dark:text-gold/25" 
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
