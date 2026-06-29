import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';

interface ScrollDrawSVGProps {
  paths: string[];
  viewBox?: string;
  className?: string;
  strokeWidth?: number;
  strokeColor?: string;
  duration?: number;
}

const ScrollDrawSVG = ({
  paths,
  viewBox = "0 0 100 100",
  className = "w-24 h-24",
  strokeWidth = 2,
  strokeColor = "currentColor"
}: ScrollDrawSVGProps) => {
  const ref = useRef<SVGSVGElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref as any,
    offset: ["start 0.9", "center center"]
  });

  const springProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 15,
    restDelta: 0.001
  });

  const opacity = useTransform(springProgress, [0, 0.1], [0, 1]);

  return (
    <svg ref={ref} viewBox={viewBox} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            pathLength: springProgress,
            opacity: opacity
          }}
        />
      ))}
    </svg>
  );
};

export default ScrollDrawSVG;
