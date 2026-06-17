import { motion } from 'framer-motion';
import React from 'react';

interface MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

/**
 * FadeIn: Smooth opacity transition wrapper
 */
export const FadeIn = ({ children, className = '', delay = 0, duration = 0.5 }: MotionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * SlideUp: Sliding up transition with spring physics (for headers/cards)
 */
export const SlideUp = ({ children, className = '', delay = 0, duration = 0.6 }: MotionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration, 
        delay 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * ScaleHover: Slight zoom and scaling on hover/tap (for buttons/cards)
 */
export const ScaleHover = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggerContainer: Orchestrates stagger delay on children animations
 */
export const StaggerContainer = ({ children, className = '', delay = 0 }: MotionProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: 0.08
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggerItem: Animated child inside StaggerContainer
 */
export const StaggerItem = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * PageTransition: Page route entry/exit transition
 */
export const PageTransition = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
