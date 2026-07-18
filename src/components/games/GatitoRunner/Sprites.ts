export const getCatSvg = (type: 'run1' | 'run2' | 'jump' | 'crouch1' | 'crouch2', _bodyColor: string, _apronColor: string) => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="catBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23${_bodyColor.replace('#', '')}"/>
      <stop offset="100%" stop-color="%23ea580c"/>
    </linearGradient>
  </defs>
  
  <g transform="${(type === 'crouch1' || type === 'crouch2') ? 'translate(0, 20) scale(1, 0.75)' : 'translate(0, 0)'}">
    
    <!-- Cola -->
    <path d="M 30 50 Q 5 ${type === 'run1' ? '60' : type === 'jump' ? '70' : '50'} 10 ${type === 'run2' ? '55' : '45'}" fill="none" stroke="url(%23catBody)" stroke-width="6" stroke-linecap="round"/>
    
    <!-- Patas traseras -->
    ${type === 'run1' ? '<path d="M 35 60 C 30 65, 25 75, 25 75 L 30 75 C 35 70, 40 60, 40 60 Z" fill="url(%23catBody)"/> <path d="M 45 55 C 40 60, 35 70, 35 70 L 40 70 C 45 65, 50 55, 50 55 Z" fill="%23c2410c"/>' : ''}
    ${type === 'run2' ? '<path d="M 35 60 C 40 65, 45 75, 45 75 L 50 75 C 45 70, 40 60, 40 60 Z" fill="url(%23catBody)"/> <path d="M 45 55 C 50 60, 55 70, 55 70 L 60 70 C 55 65, 50 55, 50 55 Z" fill="%23c2410c"/>' : ''}
    ${type === 'jump' ? '<path d="M 35 55 C 25 60, 20 70, 20 70 L 25 70 C 30 60, 40 55, 40 55 Z" fill="url(%23catBody)"/>' : ''}
    ${type === 'crouch1' || type === 'crouch2' ? '<path d="M 35 60 L 20 65 M 40 60 L 25 60" stroke="url(%23catBody)" stroke-width="6" stroke-linecap="round"/>' : ''}

    <!-- Patas delanteras -->
    ${type === 'run1' ? '<path d="M 65 60 C 60 65, 55 75, 55 75 L 60 75 C 65 70, 70 60, 70 60 Z" fill="url(%23catBody)"/> <path d="M 75 55 C 70 60, 65 70, 65 70 L 70 70 C 75 65, 80 55, 80 55 Z" fill="%23c2410c"/>' : ''}
    ${type === 'run2' ? '<path d="M 65 60 C 70 65, 75 75, 75 75 L 80 75 C 75 70, 70 60, 70 60 Z" fill="url(%23catBody)"/> <path d="M 75 55 C 80 60, 85 70, 85 70 L 90 70 C 85 65, 80 55, 80 55 Z" fill="%23c2410c"/>' : ''}
    ${type === 'jump' ? '<path d="M 70 55 C 80 60, 85 65, 85 65 L 90 60 C 80 55, 75 55, 75 55 Z" fill="url(%23catBody)"/>' : ''}
    ${type === 'crouch1' || type === 'crouch2' ? '<path d="M 70 60 L 85 65 M 75 60 L 90 60" stroke="url(%23catBody)" stroke-width="6" stroke-linecap="round"/>' : ''}

    <!-- Cuerpo principal -->
    <path d="M 30 40 C 30 25, 60 25, 70 35 C 75 30, 85 30, 90 40 C 95 50, 90 60, 75 60 L 40 60 C 25 60, 25 50, 30 40 Z" fill="url(%23catBody)"/>
    
    <!-- Cuello -->
    <path d="M 60 30 C 70 25, 80 25, 85 35 L 65 45 Z" fill="url(%23catBody)"/>
    
    <!-- Cabeza -->
    <circle cx="80" cy="42" r="14" fill="url(%23catBody)"/>

    <!-- Orejas -->
    <path d="M 70 32 L 75 18 L 82 30 Z" fill="url(%23catBody)"/>
    <path d="M 72 30 L 75 22 L 79 30 Z" fill="%23fcd34d"/>
    <path d="M 82 30 L 87 18 L 92 35 Z" fill="url(%23catBody)"/>
    <path d="M 84 30 L 87 22 L 89 32 Z" fill="%23fcd34d"/>

    <!-- Ojo -->
    <circle cx="84" cy="40" r="4.5" fill="%23ffffff"/>
    <circle cx="86" cy="40" r="2.5" fill="%23000000"/>
    
    <!-- Nariz y Bigotes -->
    <circle cx="94" cy="44" r="2" fill="%23f472b6"/>
    <path d="M 90 48 L 100 46 M 90 50 L 100 51 M 90 52 L 99 56" stroke="%23ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>

  </g>
</svg>`;

export const getCatSvg_run1 = (_bodyColor: string, _apronColor: string) => getCatSvg('run1', _bodyColor, _apronColor);
export const getCatSvg_run2 = (_bodyColor: string, _apronColor: string) => getCatSvg('run2', _bodyColor, _apronColor);
export const getCatSvg_jump = (_bodyColor: string, _apronColor: string) => getCatSvg('jump', _bodyColor, _apronColor);
export const getCatSvg_crouch1 = (_bodyColor: string, _apronColor: string) => getCatSvg('crouch1', _bodyColor, _apronColor);
export const getCatSvg_crouch2 = (_bodyColor: string, _apronColor: string) => getCatSvg('crouch2', _bodyColor, _apronColor);

export const BREAD_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M 10 70 Q 10 20 50 20 Q 90 20 90 70 L 90 90 L 10 90 Z" fill="%23d4910a" stroke="%2392400e" stroke-width="4"/>
  <path d="M 30 30 Q 50 10 70 30" fill="none" stroke="%2392400e" stroke-width="3" stroke-linecap="round"/>
  <path d="M 25 45 Q 50 25 75 45" fill="none" stroke="%2392400e" stroke-width="3" stroke-linecap="round"/>
  <path d="M 20 60 Q 50 40 80 60" fill="none" stroke="%2392400e" stroke-width="3" stroke-linecap="round"/>
  <circle cx="40" cy="40" r="1.5" fill="%23fef08a"/>
  <circle cx="60" cy="50" r="1.5" fill="%23fef08a"/>
  <circle cx="35" cy="55" r="1.5" fill="%23fef08a"/>
  <circle cx="50" cy="65" r="1.5" fill="%23fef08a"/>
</svg>`;

export const CROISSANT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M 10 50 C 30 10, 70 10, 90 50 C 70 70, 30 70, 10 50 Z" fill="%23f59e0b" stroke="%2392400e" stroke-width="4"/>
  <path d="M 25 45 Q 50 15 75 45" fill="none" stroke="%23d97706" stroke-width="4"/>
  <path d="M 40 40 Q 50 25 60 40" fill="none" stroke="%23d97706" stroke-width="4"/>
</svg>`;

export const DONUT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="%23eab308" stroke="%23a16207" stroke-width="4"/>
  <circle cx="50" cy="50" r="15" fill="%23ffffff" stroke="%23a16207" stroke-width="4"/>
  <path d="M 15 50 A 35 35 0 0 1 85 50 C 85 65 70 65 70 55 C 70 45 60 65 50 55 C 40 45 30 65 30 55 C 30 45 15 65 15 50 Z" fill="%23ec4899"/>
  <rect x="35" y="25" width="6" height="3" fill="%233b82f6" transform="rotate(45 38 26)"/>
  <rect x="60" y="30" width="6" height="3" fill="%23eab308" transform="rotate(-30 63 31)"/>
  <rect x="25" y="45" width="6" height="3" fill="%2322c55e" transform="rotate(15 28 46)"/>
  <rect x="75" y="45" width="6" height="3" fill="%23a855f7" transform="rotate(75 78 46)"/>
</svg>`;

export const BIRD_SVG_1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g transform="translate(0, 10)">
    <path d="M 85 45 C 95 35, 100 40, 95 55 C 90 50, 85 55, 80 50 Z" fill="%23171717" />
    <path d="M 30 50 C 30 25, 80 25, 85 50 C 90 75, 40 75, 30 50 Z" fill="%23262626" />
    <path d="M 35 55 C 45 70, 70 70, 80 55 C 70 60, 45 60, 35 55 Z" fill="%23404040" />
    <path d="M 50 45 C 65 15, 85 15, 75 40 C 70 50, 55 50, 50 45 Z" fill="%23525252" />
    <circle cx="35" cy="45" r="12" fill="%23262626" />
    <path d="M 12 45 C 20 40, 25 42, 25 45 C 25 48, 20 50, 12 45 Z" fill="%23f97316" />
    <circle cx="30" cy="42" r="3.5" fill="%23ef4444"/>
    <circle cx="28" cy="42" r="1.5" fill="%23000000"/>
  </g>
</svg>`;

export const BIRD_SVG_2 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g transform="translate(0, 10)">
    <path d="M 85 45 C 95 35, 100 40, 95 55 C 90 50, 85 55, 80 50 Z" fill="%23450a0a" />
    <path d="M 30 50 C 30 25, 80 25, 85 50 C 90 75, 40 75, 30 50 Z" fill="%237f1d1d" />
    <path d="M 35 55 C 45 70, 70 70, 80 55 C 70 60, 45 60, 35 55 Z" fill="%23991b1b" />
    <path d="M 50 45 C 65 30, 85 30, 75 40 C 70 50, 55 50, 50 45 Z" fill="%23b91c1c" />
    <circle cx="35" cy="45" r="12" fill="%237f1d1d" />
    <path d="M 12 45 C 20 40, 25 42, 25 45 C 25 48, 20 50, 12 45 Z" fill="%23fbbf24" />
    <circle cx="30" cy="42" r="3.5" fill="%23ffffff"/>
    <circle cx="28" cy="42" r="1.5" fill="%23000000"/>
    <path d="M 32 38 L 26 40" stroke="%23000" stroke-width="2"/>
  </g>
</svg>`;

export const COFFEE_SPILL_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M 10 80 Q 20 60 40 70 T 70 65 T 90 80 Q 70 95 50 95 T 10 80 Z" fill="%234a3018"/>
  <path d="M 20 75 Q 30 65 40 75 T 60 70" fill="none" stroke="%2378350f" stroke-width="3"/>
  <circle cx="30" cy="85" r="4" fill="%2378350f"/>
  <circle cx="70" cy="75" r="3" fill="%2378350f"/>
</svg>`;

export const COIN_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="%23cbd5e1" stroke="%2394a3b8" stroke-width="4"/>
  <circle cx="50" cy="50" r="32" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-dasharray="4,4"/>
  <text x="50" y="65" font-family="Arial" font-size="40" font-weight="bold" fill="%2364748b" text-anchor="middle">¢</text>
  <path d="M 20 30 Q 30 20 40 20" fill="none" stroke="%23ffffff" stroke-width="4" stroke-linecap="round"/>
</svg>`;

export const GOLD_COIN_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="%23fbbf24" stroke="%23b45309" stroke-width="4"/>
  <circle cx="50" cy="50" r="32" fill="none" stroke="%23b45309" stroke-width="2" stroke-dasharray="4,4"/>
  <text x="50" y="65" font-family="Arial" font-size="40" font-weight="bold" fill="%2392400e" text-anchor="middle">★</text>
  <path d="M 20 30 Q 30 20 40 20" fill="none" stroke="%23ffffff" stroke-width="4" stroke-linecap="round"/>
</svg>`;

export const ESPRESSO_SHOT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="30" y="30" width="40" height="50" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="4" rx="5"/>
  <rect x="34" y="45" width="32" height="31" fill="%234a3018" />
  <rect x="34" y="40" width="32" height="5" fill="%23d97706" />
  <path d="M 70 45 Q 85 45 80 60 Q 75 70 70 70" fill="none" stroke="%23f8fafc" stroke-width="6" stroke-linecap="round"/>
  <path d="M 40 20 Q 45 10 50 15 T 45 5" fill="none" stroke="%23d1d5db" stroke-width="3" stroke-linecap="round"/>
  <path d="M 60 25 Q 65 15 55 10" fill="none" stroke="%23d1d5db" stroke-width="3" stroke-linecap="round"/>
</svg>`;

export const LATTE_ART_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="4"/>
  <circle cx="50" cy="50" r="35" fill="%234a3018"/>
  <path d="M 50 70 C 20 40 30 20 50 35 C 70 20 80 40 50 70 Z" fill="%23fef3c7"/>
</svg>`;

export const BEAN_PROJECTILE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <ellipse cx="50" cy="50" rx="30" ry="20" fill="%2378350f" />
  <path d="M 25 50 Q 50 70 75 50" fill="none" stroke="%23451a03" stroke-width="4"/>
</svg>`;

export const BOSS_SVG_NORMAL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <ellipse cx="50" cy="60" rx="40" ry="30" fill="%23a8a29e"/>
  <circle cx="35" cy="50" r="5" fill="%23000"/>
  <circle cx="65" cy="50" r="5" fill="%23000"/>
  <ellipse cx="50" cy="65" rx="10" ry="5" fill="%23fca5a5"/>
  <path d="M 20 30 Q 30 10 40 30 Z" fill="%23a8a29e"/>
  <path d="M 80 30 Q 70 10 60 30 Z" fill="%23a8a29e"/>
  <path d="M 30 20 L 70 20 L 60 0 L 40 0 Z" fill="%23ffffff" stroke="%23d1d5db" stroke-width="2"/>
  <rect x="10" y="75" width="80" height="25" fill="%23ef4444"/>
</svg>`;

export const BOSS_SVG_ANGRY = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <ellipse cx="50" cy="60" rx="40" ry="30" fill="%2378716c"/>
  <circle cx="35" cy="50" r="5" fill="%23ef4444"/>
  <circle cx="65" cy="50" r="5" fill="%23ef4444"/>
  <path d="M 25 45 L 45 50" stroke="%23000" stroke-width="3"/>
  <path d="M 75 45 L 55 50" stroke="%23000" stroke-width="3"/>
  <ellipse cx="50" cy="65" rx="10" ry="5" fill="%23fca5a5"/>
  <path d="M 20 30 Q 30 10 40 30 Z" fill="%2378716c"/>
  <path d="M 80 30 Q 70 10 60 30 Z" fill="%2378716c"/>
  <path d="M 30 20 L 70 20 L 60 0 L 40 0 Z" fill="%23ffffff" stroke="%23d1d5db" stroke-width="2"/>
  <rect x="10" y="75" width="80" height="25" fill="%23b91c1c"/>
</svg>`;

export const POWERUP_SHIELD_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M 50 10 L 90 25 L 90 50 C 90 75 50 90 50 90 C 50 90 10 75 10 50 L 10 25 Z" fill="%233b82f6" stroke="%231d4ed8" stroke-width="4"/>
  <path d="M 50 20 L 80 30 L 80 50 C 80 65 50 80 50 80 C 50 80 20 65 20 50 L 20 30 Z" fill="%2360a5fa"/>
  <path d="M 40 50 L 45 60 L 65 40" fill="none" stroke="%23ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export const POWERUP_MAGNET_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M 25 80 L 25 50 A 25 25 0 0 1 75 50 L 75 80" fill="none" stroke="%23ef4444" stroke-width="20"/>
  <rect x="15" y="70" width="20" height="15" fill="%2394a3b8"/>
  <rect x="65" y="70" width="20" height="15" fill="%2394a3b8"/>
  <path d="M 35 25 Q 50 10 65 25" fill="none" stroke="%23fbbf24" stroke-width="4" stroke-dasharray="5,5"/>
  <path d="M 40 35 Q 50 25 60 35" fill="none" stroke="%23fbbf24" stroke-width="4" stroke-dasharray="5,5"/>
</svg>`;

export const BOSS_PROJECTILE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="25" fill="%23ef4444" stroke="%237f1d1d" stroke-width="4"/>
  <circle cx="40" cy="40" r="6" fill="%23fca5a5"/>
  <path d="M 50 25 L 50 15 M 50 75 L 50 85 M 25 50 L 15 50 M 75 50 L 85 50" stroke="%23ef4444" stroke-width="4" stroke-linecap="round"/>
</svg>`;

const imageCache: Record<string, HTMLImageElement> = {};
export const loadSprite = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    if (imageCache[src]) {
      resolve(imageCache[src]);
      return;
    }
    const img = new Image();
    img.src = src;
    img.onload = () => {
      imageCache[src] = img;
      resolve(img);
    };
  });
};

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export const createParticles = (x: number, y: number, count: number, color: string): Particle[] => {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      life: 1,
      maxLife: 20 + Math.random() * 20,
      color,
      size: 2 + Math.random() * 4
    });
  }
  return particles;
};

export const updateAndDrawParticles = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life++;
    if (p.life >= p.maxLife) {
      particles.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = 1 - p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
};

export const drawSprite = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, alpha: number = 1) => {
  if (img.complete) {
    if (alpha !== 1) {
      const oldAlpha = ctx.globalAlpha;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, x, y, w, h);
      ctx.globalAlpha = oldAlpha;
    } else {
      ctx.drawImage(img, x, y, w, h);
    }
  }
};
