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
  <path d="M 10 70 Q 10 30 50 30 Q 90 30 90 70 L 90 90 L 10 90 Z" fill="%23c68e17" stroke="%238b4513" stroke-width="4"/>
</svg>`;

export const CROISSANT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M 10 50 C 30 10, 70 10, 90 50 C 70 70, 30 70, 10 50 Z" fill="%23e8b031" stroke="%23a0522d" stroke-width="4"/>
</svg>`;

export const DONUT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23ff69b4" stroke="%23c71585" stroke-width="5"/><circle cx="50" cy="50" r="15" fill="%23ffffff" stroke="%23c71585" stroke-width="5"/></svg>`;
export const BIRD_SVG_1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g transform="translate(0, 10)">
    <path d="M 85 45 C 95 35, 100 40, 95 55 C 90 50, 85 55, 80 50 Z" fill="%231e3a8a" />
    <path d="M 30 50 C 30 25, 80 25, 85 50 C 90 75, 40 75, 30 50 Z" fill="%233b82f6" />
    <path d="M 35 55 C 45 70, 70 70, 80 55 C 70 60, 45 60, 35 55 Z" fill="%2393c5fd" />
    <path d="M 50 45 C 65 15, 85 15, 75 40 C 70 50, 55 50, 50 45 Z" fill="%2360a5fa" />
    <path d="M 55 42 C 65 20, 80 20, 72 40" fill="none" stroke="%232563eb" stroke-width="2" />
    <circle cx="35" cy="45" r="12" fill="%233b82f6" />
    <path d="M 12 45 C 20 40, 25 42, 25 45 C 25 48, 20 50, 12 45 Z" fill="%23facc15" />
    <circle cx="30" cy="42" r="3.5" fill="%23ffffff"/>
    <circle cx="28" cy="42" r="1.5" fill="%23000000"/>
  </g>
</svg>`;
export const BIRD_SVG_2 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g transform="translate(0, 10)">
    <path d="M 85 45 C 95 35, 100 40, 95 55 C 90 50, 85 55, 80 50 Z" fill="%23ef4444" />
    <path d="M 30 50 C 30 25, 80 25, 85 50 C 90 75, 40 75, 30 50 Z" fill="%23f87171" />
    <path d="M 35 55 C 45 70, 70 70, 80 55 C 70 60, 45 60, 35 55 Z" fill="%23fca5a5" />
    <path d="M 50 45 C 65 30, 85 30, 75 40 C 70 50, 55 50, 50 45 Z" fill="%23fca5a5" />
    <path d="M 55 42 C 65 35, 80 35, 72 40" fill="none" stroke="%23dc2626" stroke-width="2" />
    <circle cx="35" cy="45" r="12" fill="%23f87171" />
    <path d="M 12 45 C 20 40, 25 42, 25 45 C 25 48, 20 50, 12 45 Z" fill="%23facc15" />
    <circle cx="30" cy="42" r="3.5" fill="%23ffffff"/>
    <circle cx="28" cy="42" r="1.5" fill="%23000000"/>
  </g>
</svg>`;
export const COFFEE_SPILL_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M 10 80 Q 50 60 90 80 Q 70 100 30 100 Z" fill="%234a3018"/></svg>`;
export const COIN_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23fbbf24" stroke="%23b45309" stroke-width="5"/></svg>`;
export const ESPRESSO_SHOT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="30" y="20" width="40" height="60" fill="%2327272a" /><rect x="35" y="25" width="30" height="50" fill="%234a3018" /></svg>`;
export const LATTE_ART_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23fef3c7" stroke="%23d97706" stroke-width="5"/></svg>`;
export const BEAN_PROJECTILE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="30" ry="20" fill="%2378350f" /><path d="M 20 50 Q 50 70 80 50" fill="none" stroke="%23451a03" stroke-width="4"/></svg>`;
export const BOSS_SVG_NORMAL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="10" fill="%23ef4444" /></svg>`;
export const BOSS_SVG_ANGRY = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="10" fill="%23b91c1c" /></svg>`;
export const POWERUP_SHIELD_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="%233b82f6" stroke-width="8"/></svg>`;
export const POWERUP_MAGNET_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M 30 80 L 30 40 Q 50 10 70 40 L 70 80" fill="none" stroke="%23ef4444" stroke-width="15"/></svg>`;
export const BOSS_PROJECTILE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="20" fill="%23ef4444" /></svg>`;

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
