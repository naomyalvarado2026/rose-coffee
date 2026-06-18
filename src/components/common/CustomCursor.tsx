import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// High-tech curved brackets with inner tick marks
const CursorHUD = ({ color = '#c8922a', isHovered = false }: { color?: string; isHovered?: boolean }) => (
  <svg 
    width="100%" 
    height="100%" 
    viewBox="0 0 100 100" 
    fill="none" 
    className="w-full h-full"
    style={{ 
      transition: 'stroke 0.3s, opacity 0.3s',
      opacity: isHovered ? 0.95 : 0.45 
    }}
  >
    {/* Four corner brackets */}
    <path d="M 25 10 A 40 40 0 0 0 10 25" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 90 25 A 40 40 0 0 0 75 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 75 90 A 40 40 0 0 0 90 75" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 10 75 A 40 40 0 0 0 25 90" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    
    {/* Micro ticks pointing inside */}
    <line x1="50" y1="6" x2="50" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="50" y1="86" x2="50" y2="94" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="6" y1="50" x2="14" y2="50" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="86" y1="50" x2="94" y2="50" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const ringX = useMotionValue(-100);
  const ringY = useMotionValue(-100);
  
  // Spring configuration for buttery smooth lag on the outer HUD
  const springConfig = { damping: 30, stiffness: 220, mass: 0.5 };
  const cursorSpringX = useSpring(cursorX, { damping: 40, stiffness: 450 });
  const cursorSpringY = useSpring(cursorY, { damping: 40, stiffness: 450 });
  
  const ringSpringX = useSpring(ringX, springConfig);
  const ringSpringY = useSpring(ringY, springConfig);
  
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);

  // Check for mouse/fine pointer device to prevent cursor issues on touchscreens
  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: fine)');
    setIsFinePointer(mediaQuery.matches);
    
    const listener = (e: MediaQueryListEvent) => {
      setIsFinePointer(e.matches);
    };
    
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (!isFinePointer) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      ringX.set(e.clientX);
      ringY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, isFinePointer]);

  useEffect(() => {
    if (!isFinePointer) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      let isClickable = false;
      try {
        const computedStyle = window.getComputedStyle(target);
        isClickable = 
          computedStyle.cursor === 'pointer' ||
          target.tagName === 'A' || 
          target.tagName === 'BUTTON' || 
          target.closest('a') !== null || 
          target.closest('button') !== null || 
          target.classList.contains('cursor-pointer') || 
          target.closest('.cursor-pointer') !== null ||
          target.getAttribute('role') === 'button' ||
          target.closest('[role="button"]') !== null;
      } catch (err) {
        isClickable = 
          target.tagName === 'A' || 
          target.tagName === 'BUTTON' || 
          target.closest('a') !== null || 
          target.closest('button') !== null || 
          target.classList.contains('cursor-pointer') || 
          target.getAttribute('role') === 'button';
      }
      
      setIsHovered(isClickable);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isFinePointer]);

  if (!isFinePointer || !isVisible) return null;

  return (
    <>
      {/* 1. Futuristic Outer HUD brackets */}
      <motion.div
        style={{
          position: 'fixed',
          left: ringSpringX,
          top: ringSpringY,
          translateX: '-50%',
          translateY: '-50%',
          width: isHovered ? 52 : 36,
          height: isHovered ? 52 : 36,
          pointerEvents: 'none',
          zIndex: 99999,
          transformOrigin: 'center',
        }}
        animate={{
          scale: isClicked ? 0.8 : 1,
          rotate: isHovered ? 45 : 0, // snaps 45 degrees on link hover
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 20,
          rotate: { type: 'spring', stiffness: 150, damping: 12 }
        }}
      >
        <CursorHUD color={isHovered ? '#c8922a' : '#6b3a0e'} isHovered={isHovered} />
      </motion.div>

      {/* 2. Middle rotating dashed ring */}
      <motion.div
        style={{
          position: 'fixed',
          left: ringSpringX,
          top: ringSpringY,
          translateX: '-50%',
          translateY: '-50%',
          width: isHovered ? 36 : 22,
          height: isHovered ? 36 : 22,
          border: isHovered ? '1.2px dashed rgba(200, 146, 42, 0.5)' : '1px dashed rgba(107, 58, 14, 0.35)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          transformOrigin: 'center',
        }}
        animate={{
          rotate: 360,
          scale: isClicked ? 0.85 : 1,
        }}
        transition={{
          rotate: { repeat: Infinity, duration: isHovered ? 6 : 10, ease: 'linear' },
          scale: { type: 'spring', stiffness: 350, damping: 15 }
        }}
      />

      {/* 3. Center Glowing Active Dot */}
      <motion.div
        style={{
          position: 'fixed',
          left: cursorSpringX,
          top: cursorSpringY,
          translateX: '-50%',
          translateY: '-50%',
          width: isHovered ? 6 : 4,
          height: isHovered ? 6 : 4,
          backgroundColor: isHovered ? '#021a54' : '#c8922a', // transforms colors on interactives
          border: isHovered ? '1px solid #c8922a' : 'none',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          boxShadow: isHovered 
            ? '0 0 10px rgba(200, 146, 42, 0.8), 0 0 4px rgba(2, 26, 84, 0.5)' 
            : '0 0 6px rgba(200, 146, 42, 0.6)',
        }}
        animate={{
          scale: isClicked ? 0.7 : 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      />
    </>
  );
}
