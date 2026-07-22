import React from 'react';

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  className = '',
  size = 250,
  duration = 8,
  delay = 0,
  colorFrom = '#C5A059',
  colorTo = '#E6C875',
}) => {
  return (
    <div
      style={
        {
          '--size': `${size}px`,
          '--duration': `${duration}s`,
          '--delay': `${delay}s`,
          '--color-from': colorFrom,
          '--color-to': colorTo,
        } as React.CSSProperties
      }
      className={`pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(white,white)] ${className}`}
    >
      <div className="absolute inset-0 rounded-[inherit] [border:1px_solid_transparent] [background:linear-gradient(to_bottom,var(--color-from),var(--color-to))_border-box] animate-border-beam" />
    </div>
  );
};
