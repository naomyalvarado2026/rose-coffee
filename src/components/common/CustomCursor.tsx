import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const ringX = useMotionValue(-100);
  const ringY = useMotionValue(-100);
  
  // Spring configuration for buttery smooth lag on the outer ring
  const springConfig = { damping: 25, stiffness: 250, mass: 0.4 };
  const cursorSpringX = useSpring(cursorX, { damping: 40, stiffness: 500 });
  const cursorSpringY = useSpring(cursorY, { damping: 40, stiffness: 500 });
  
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
      {/* Outer Spring Ring */}
      <motion.div
        style={{
          position: 'fixed',
          left: ringSpringX,
          top: ringSpringY,
          translateX: '-50%',
          translateY: '-50%',
          width: isHovered ? 40 : 20,
          height: isHovered ? 40 : 20,
          border: isHovered 
            ? '1.5px solid #c8922a' 
            : '1px solid rgba(107, 58, 14, 0.45)', // coffee brown border
          borderRadius: '50%',
          backgroundColor: isHovered 
            ? 'rgba(200, 146, 42, 0.05)' 
            : 'transparent',
          pointerEvents: 'none',
          zIndex: 99999,
          transformOrigin: 'center',
        }}
        animate={{
          scale: isClicked ? 0.8 : 1,
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 20
        }}
      />

      {/* Inner Core Active Dot */}
      <motion.div
        style={{
          position: 'fixed',
          left: cursorSpringX,
          top: cursorSpringY,
          translateX: '-50%',
          translateY: '-50%',
          width: 6,
          height: 6,
          backgroundColor: isHovered ? '#c8922a' : '#6b3a0e', // gold on hover, coffee on default
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          boxShadow: isHovered 
            ? '0 0 8px rgba(200, 146, 42, 0.5)' 
            : 'none',
        }}
        animate={{
          scale: isClicked ? 0.6 : 1,
        }}
        transition={{ type: 'spring', stiffness: 450, damping: 15 }}
      />
    </>
  );
}
