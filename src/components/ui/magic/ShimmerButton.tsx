import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ShimmerButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  className?: string;
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      children,
      shimmerColor = '#ffffff',
      shimmerSize = '0.1em',
      borderRadius = '1rem',
      shimmerDuration = '2.5s',
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 ease-in-out dark:text-stone-900 ${className}`}
        style={{
          borderRadius,
        }}
        {...props}
      >
        {/* Shimmer background animation */}
        <div
          className="absolute inset-0 z-[-1] overflow-hidden"
          style={{ borderRadius }}
        >
          <div
            className="animate-shimmer absolute inset-0"
            style={{
              animationDuration: shimmerDuration,
              background: `linear-gradient(90deg, transparent 0%, ${shimmerColor} 30%, transparent 100%)`,
              padding: shimmerSize,
            }}
          />
        </div>
        
        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </motion.button>
    );
  }
);

ShimmerButton.displayName = 'ShimmerButton';
