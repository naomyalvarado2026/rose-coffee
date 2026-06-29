import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ConfettiProps {
  active: boolean;
  duration?: number; // Duration in ms
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
  endXOffset: number;
  endRotation: number;
  duration: number;
  isCircle: boolean;
}

const COLORS = ['#f43f5e', '#fbbf24', '#34d399', '#38bdf8', '#a78bfa', '#fb923c'];

const Confetti: React.FC<ConfettiProps> = ({ active, duration = 3000 }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (active) {
      // Generate particles
      const newParticles: Particle[] = Array.from({ length: 80 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // random start horizontal position (vw)
        y: -10, // start above the screen
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 8 + 6, // 6 to 14px
        rotation: Math.random() * 360,
        delay: Math.random() * 0.5, // stagger start
        endXOffset: Math.random() * 20 - 10,
        endRotation: Math.random() * 720 - 360,
        duration: Math.random() * 1.5 + 1.5,
        isCircle: Math.random() > 0.5
      }));
      setParticles(newParticles);
      setIsVisible(true);

      timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
    } else {
      setIsVisible(false);
      setParticles([]);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [active, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ 
            x: `${p.x}vw`, 
            y: '-10vh', 
            rotate: p.rotation,
            opacity: 1
          }}
          animate={{
            y: '110vh',
            x: `${p.x + p.endXOffset}vw`,
            rotate: p.rotation + p.endRotation,
            opacity: [1, 1, 1, 0]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
            opacity: {
              times: [0, 0.8, 0.9, 1]
            }
          }}
          className="absolute"
          style={{
            width: p.size,
            height: p.size * 0.8,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
