import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const ringX = useMotionValue(-100);
  const ringY = useMotionValue(-100);
  
  // Spring configuration for buttery smooth lag on the outer ring
  const springConfig = { damping: 30, stiffness: 220, mass: 0.5 };
  const cursorSpringX = useSpring(cursorX, { damping: 40, stiffness: 450 });
  const cursorSpringY = useSpring(cursorY, { damping: 40, stiffness: 450 });
  
  const ringSpringX = useSpring(ringX, springConfig);
  const ringSpringY = useSpring(ringY, springConfig);
  
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
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
  }, [isVisible]);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const isClickable = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('a') || 
        target.closest('button') || 
        target.classList.contains('cursor-pointer') || 
        target.getAttribute('role') === 'button';
      setIsHovered(!!isClickable);
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
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Futuristic Outer Ring */}
      <motion.div
        style={{
          position: 'fixed',
          left: ringSpringX,
          top: ringSpringY,
          translateX: '-50%',
          translateY: '-50%',
          width: isHovered ? 44 : 22,
          height: isHovered ? 44 : 22,
          border: isHovered ? '1.5px solid #c8922a' : '1px solid #6b3a0e',
          backgroundColor: isHovered ? 'rgba(200, 146, 42, 0.08)' : 'transparent',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          transformOrigin: 'center',
        }}
        animate={{
          scale: isClicked ? 0.75 : 1,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 15 }}
      />
      {/* Inner Active Dot */}
      <motion.div
        style={{
          position: 'fixed',
          left: cursorSpringX,
          top: cursorSpringY,
          translateX: '-50%',
          translateY: '-50%',
          width: isHovered ? 6 : 4,
          height: isHovered ? 6 : 4,
          backgroundColor: isHovered ? '#c8922a' : '#6b3a0e',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
        }}
      />
    </>
  );
}
