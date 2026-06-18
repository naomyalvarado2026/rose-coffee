import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import breadImg from '../../assets/sourdough_bread.png';

interface Benefit {
  id: string;
  label: string;
  lx: number; ly: number;   // label anchor (top-left of label box)
  px: number; py: number;   // point on the bread edge
  anchor: 'left' | 'right'; // text alignment & which side of label to draw line from
}

const BENEFITS: Benefit[] = [
  { id: 'digestion',   label: 'Mejor digestión',                        lx: 5,   ly: 16,  px: 77,  py: 44,  anchor: 'left'  },
  { id: 'prebiotics',  label: 'Fuente natural de prebióticos',           lx: 145, ly: 16,  px: 123, py: 44,  anchor: 'right' },
  { id: 'glycemic',    label: 'Índice glucémico más bajo',               lx: 5,   ly: 62,  px: 66,  py: 69,  anchor: 'left'  },
  { id: 'nutrients',   label: 'Mayor biodisponibilidad de nutrientes',   lx: 145, ly: 62,  px: 134, py: 69,  anchor: 'right' },
  { id: 'texture',     label: 'Texturas, sabores y aromas superiores',  lx: 5,   ly: 102, px: 77,  py: 94,  anchor: 'left'  },
  { id: 'noAdditives', label: 'Sin aditivos ni levaduras industriales', lx: 145, ly: 102, px: 123, py: 94,  anchor: 'right' },
];

function curveToPath(x1: number, y1: number, x2: number, y2: number) {
  // A quadratic Bezier curve starting horizontally from the text and curving to the bread
  const cx = x1 + (x2 - x1) * 0.45;
  const cy = y1;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

export default function SourdoughBenefits() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="text-center mb-8 space-y-3"
      >
        <span className="inline-block text-[10px] font-bold text-coffee uppercase tracking-widest border border-coffee/25 bg-coffee/5 px-4 py-1.5 rounded-full">
          Pan de Masa Madre
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-primary">
          ¿Por qué elegir la masa madre?
        </h2>
        <p className="text-stone-500 text-sm max-w-lg mx-auto leading-relaxed">
          Fermentación natural de 24 horas que transforma los granos en un alimento vivo, nutritivo y de sabor incomparable.
        </p>
      </motion.div>

      {/* Annotated Diagram */}
      <div ref={ref} className="max-w-3xl mx-auto">
        <svg
          viewBox="0 0 200 138"
          className="w-full h-auto select-none"
          style={{ overflow: 'visible' }}
          role="img"
          aria-label="Diagrama de beneficios del pan de masa madre artesanal"
        >
          <defs>
            {/* Clip path to crop the square image background to a perfect circle */}
            <clipPath id="bread-clip">
              <circle cx="100" cy="69" r="30" />
            </clipPath>
            {/* Smooth drop shadow filter for the clipped circular image */}
            <filter id="shadow-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#6b3a0e" flood-opacity="0.22" />
            </filter>
          </defs>

          {/* Glowing background ring behind bread */}
          <motion.circle
            cx="100"
            cy="69"
            r="31"
            fill="#c8922a"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={
              hoveredId !== null 
                ? { opacity: 0.18, scale: 1.05 } 
                : { opacity: 0.04, scale: 1 }
            }
            transition={{ duration: 0.3 }}
            style={{ filter: 'blur(1.5px)' }}
          />

          {/* Central bread image wrapped in shadow and scale motion group */}
          <motion.g 
            filter="url(#shadow-blur)"
            whileHover={{ scale: 1.04 }}
            animate={hoveredId !== null ? { scale: 1.015 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className="cursor-pointer"
          >
            <image
              href={breadImg}
              x="63"
              y="22"
              width="74"
              height="94"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#bread-clip)"
            />
          </motion.g>

          {BENEFITS.map((b, i) => {
            const delay = i * 0.08 + 0.25;
            // Line starts at label edge with a gap, ends outside bread
            const lineStartX = b.anchor === 'left' ? b.lx + 50 + 4.5 : b.lx - 4.5;
            const lineStartY = b.ly + 4; // Vertically center the line with the label
            const isHovered = hoveredId === b.id;
            const isAnyHovered = hoveredId !== null;

            return (
              <g 
                key={b.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredId(b.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Interactive wide invisible path to make hover easier */}
                <path
                  d={curveToPath(lineStartX, lineStartY, b.px, b.py)}
                  stroke="transparent"
                  strokeWidth="6"
                  fill="none"
                />

                {/* Animated SVG path - Background glow on hover */}
                <motion.path
                  d={curveToPath(lineStartX, lineStartY, b.px, b.py)}
                  stroke="#c8922a"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={
                    isHovered 
                      ? { pathLength: 1, opacity: 0.28 } 
                      : { pathLength: inView ? 1 : 0, opacity: 0 }
                  }
                  transition={{ duration: 0.25 }}
                />

                {/* Animated SVG path - Main line */}
                <motion.path
                  d={curveToPath(lineStartX, lineStartY, b.px, b.py)}
                  stroke={isHovered ? '#c8922a' : '#a07850'}
                  strokeWidth={isHovered ? '0.75' : '0.45'}
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={
                    inView
                      ? { 
                          pathLength: 1, 
                          opacity: isAnyHovered ? (isHovered ? 1 : 0.12) : 0.55 
                        }
                      : { pathLength: 0, opacity: 0 }
                  }
                  transition={
                    isHovered 
                      ? { duration: 0.2 } 
                      : { delay, duration: 0.55, ease: 'easeOut' }
                  }
                />

                {/* Micro dot at label start */}
                <motion.circle
                  cx={lineStartX}
                  cy={lineStartY}
                  r={isHovered ? 1.4 : 0.8}
                  fill={isHovered ? '#c8922a' : '#a07850'}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={
                    inView
                      ? { 
                          opacity: isAnyHovered ? (isHovered ? 1 : 0.12) : 0.7,
                          scale: 1
                        }
                      : { opacity: 0, scale: 0 }
                  }
                  transition={{ delay: delay + 0.08, duration: 0.3 }}
                />

                {/* Pulsing ring around contact dot */}
                <motion.circle
                  cx={b.px}
                  cy={b.py}
                  r={isHovered ? 2.6 : 1.8}
                  stroke={isHovered ? '#c8922a' : '#6b3a0e'}
                  strokeWidth="0.25"
                  fill="none"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={
                    inView
                      ? {
                          opacity: isAnyHovered ? (isHovered ? [0.8, 0.2, 0.8] : 0.05) : [0.4, 0.1, 0.4],
                          scale: isHovered ? [0.95, 1.55, 0.95] : [0.8, 1.35, 0.8]
                        }
                      : { opacity: 0 }
                  }
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: 'easeInOut',
                    delay: delay + 0.4
                  }}
                />

                {/* Solid center dot at bread contact point */}
                <motion.circle
                  cx={b.px}
                  cy={b.py}
                  r={isHovered ? 1.5 : 1.1}
                  fill={isHovered ? '#c8922a' : '#6b3a0e'}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={
                    inView
                      ? { 
                          opacity: isAnyHovered ? (isHovered ? 1 : 0.12) : 0.85,
                          scale: 1
                        }
                      : { opacity: 0, scale: 0 }
                  }
                  transition={{ delay: delay + 0.35, duration: 0.25 }}
                />

                {/* Label text using foreignObject */}
                <foreignObject
                  x={b.lx}
                  y={b.ly - 2}
                  width="50"
                  height="20"
                  style={{ overflow: 'visible' }}
                >
                  <motion.div
                    initial={{ opacity: 0, x: b.anchor === 'left' ? -4 : 4 }}
                    animate={
                      inView
                        ? { 
                            opacity: isAnyHovered ? (isHovered ? 1 : 0.22) : 1,
                            x: isHovered ? (b.anchor === 'left' ? 1.5 : -1.5) : 0,
                            scale: isHovered ? 1.04 : 1
                          }
                        : { opacity: 0, x: b.anchor === 'left' ? -4 : 4 }
                    }
                    transition={{ 
                      type: 'spring',
                      stiffness: 190,
                      damping: 17,
                      delay: isAnyHovered ? 0 : delay - 0.05
                    }}
                    style={{
                      fontSize: '4.8px',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: isHovered ? '700' : '600',
                      color: isHovered ? '#6b3a0e' : '#021a54', // Golden/Coffee brown on hover, deep blue normally
                      lineHeight: '1.4',
                      textAlign: b.anchor === 'left' ? 'right' : 'left', // Align text towards the central image
                      whiteSpace: 'normal',
                      width: '50px',
                      transition: 'color 0.25s ease'
                    }}
                  >
                    {b.label}
                  </motion.div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
