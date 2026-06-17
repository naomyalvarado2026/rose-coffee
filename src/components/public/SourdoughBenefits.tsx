import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import breadImg from '../../assets/sourdough_bread.png';

interface Benefit {
  id: string;
  label: string;
  lx: number; ly: number;   // label anchor (top-left of label box)
  px: number; py: number;   // point on the bread edge
  anchor: 'left' | 'right'; // text alignment & which side of label to draw line from
}

const BENEFITS: Benefit[] = [
  { id: 'digestion',   label: 'Mejor digestión',                        lx: 5,   ly: 16,  px: 80,  py: 48,  anchor: 'left'  },
  { id: 'prebiotics',  label: 'Fuente natural de prebióticos',           lx: 145, ly: 16,  px: 120, py: 48,  anchor: 'right' },
  { id: 'glycemic',    label: 'Índice glucémico más bajo',               lx: 5,   ly: 62,  px: 71,  py: 69,  anchor: 'left'  },
  { id: 'nutrients',   label: 'Mayor biodisponibilidad de nutrientes',   lx: 145, ly: 62,  px: 129, py: 69,  anchor: 'right' },
  { id: 'texture',     label: 'Texturas, sabores y aromas superiores',  lx: 5,   ly: 102, px: 80,  py: 90,  anchor: 'left'  },
  { id: 'noAdditives', label: 'Sin aditivos ni levaduras industriales', lx: 145, ly: 102, px: 120, py: 90,  anchor: 'right' },
];

function lineToPath(x1: number, y1: number, x2: number, y2: number) {
  return `M ${x1} ${y1} L ${x2} ${y2}`;
}

export default function SourdoughBenefits() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

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
          className="w-full h-auto"
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

          {/* Central bread image wrapped in shadow group */}
          <g filter="url(#shadow-blur)">
            <image
              href={breadImg}
              x="63"
              y="22"
              width="74"
              height="94"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#bread-clip)"
            />
          </g>

          {BENEFITS.map((b, i) => {
            const delay = i * 0.08 + 0.25;
            // Line starts at label edge, ends at bread
            const lineStartX = b.anchor === 'left' ? b.lx + 50 : b.lx;
            const lineStartY = b.ly + 4; // Vertically center the line with the label

            return (
              <g key={b.id}>
                {/* Animated SVG path */}
                <motion.path
                  d={lineToPath(lineStartX, lineStartY, b.px, b.py)}
                  stroke="#a07850"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={inView ? { pathLength: 1, opacity: 0.55 } : { pathLength: 0, opacity: 0 }}
                  transition={{ delay, duration: 0.45, ease: 'easeOut' }}
                />

                {/* Small dot at bread contact point */}
                <motion.circle
                  cx={b.px} cy={b.py} r="1.2"
                  fill="#6b3a0e"
                  initial={{ opacity: 0, r: 0 }}
                  animate={inView ? { opacity: 0.7, r: 1.2 } : { opacity: 0, r: 0 }}
                  transition={{ delay: delay + 0.42, duration: 0.2 }}
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
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: delay - 0.05, duration: 0.4 }}
                    style={{
                      fontSize: '4.8px',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: '600',
                      color: '#021a54', // Dark blue text for perfect contrast
                      lineHeight: '1.4',
                      textAlign: b.anchor === 'left' ? 'right' : 'left', // Align text towards the central image
                      whiteSpace: 'normal',
                      width: '50px',
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
