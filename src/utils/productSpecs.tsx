export interface ProductFeature {
  text: string;
  icon?: string;
  iconType?: 'none' | 'svg' | 'emoji';
}

export const SPEC_ICONS = {
  weight: {
    name: 'Peso / Báscula',
    svg: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 16c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2" />
        <rect x="2" y="16" width="20" height="4" rx="1" />
        <path d="M12 14V3" />
        <path d="M20 7c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v2h16V7Z" />
      </svg>
    )
  },
  fermentation: {
    name: 'Fermentación / Tiempo',
    svg: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
        <path d="M12 2a10 10 0 0 1 10 10c0 2.5-1 4.8-2.6 6.4L18 16" />
      </svg>
    )
  },
  allergen: {
    name: 'Alérgenos / Cuidado',
    svg: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    )
  },
  ingredients: {
    name: 'Ingredientes / Lista',
    svg: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="9" y1="9" x2="15" y2="9" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="15" y2="17" />
      </svg>
    )
  },
  wheat: {
    name: 'Trigo / Harina / Gluten',
    svg: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20" />
        <path d="M12 4c1.5 1 3 3 3 5s-1.5 3-3 3" />
        <path d="M12 4c-1.5 1-3 3-3 5s1.5 3 3 3" />
        <path d="M12 10c1.5 1 3 3 3 5s-1.5 3-3 3" />
        <path d="M12 10c-1.5 1-3 3-3 5s1.5 3 3 3" />
        <path d="M12 7c2-1 4-.5 5 1" />
        <path d="M12 7c-2-1-4-.5-5 1" />
        <path d="M12 13c2-1 4-.5 5 1" />
        <path d="M12 13c-2-1-4-.5-5 1" />
      </svg>
    )
  },
  coffee: {
    name: 'Café / Granos / Taza',
    svg: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="2" x2="6" y2="4" />
        <line x1="10" y1="2" x2="10" y2="4" />
        <line x1="14" y1="2" x2="14" y2="4" />
      </svg>
    )
  },
  leaf: {
    name: 'Hoja / Orgánico / Vegano',
    svg: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Z" />
        <path d="M9 22v-4h-2" />
      </svg>
    )
  },
  thermometer: {
    name: 'Temperatura / Tueste',
    svg: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
      </svg>
    )
  },
  heart: {
    name: 'Corazón / Saludable',
    svg: (className = "w-4 h-4") => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    )
  }
};

export type SpecIconKey = keyof typeof SPEC_ICONS;

export function autoDetectIcon(text: string): { icon: SpecIconKey | string; iconType: 'svg' | 'emoji' | 'none' } {
  const t = text.toLowerCase();
  if (t.includes('peso') || t.includes('gramos') || t.includes('kg') || t.includes(' g ') || t.endsWith('g')) {
    return { icon: 'weight', iconType: 'svg' };
  }
  if (t.includes('ferment') || t.includes('tiempo') || t.includes('hora') || t.includes('h ') || t.endsWith('h')) {
    return { icon: 'fermentation', iconType: 'svg' };
  }
  if (t.includes('alérgen') || t.includes('contiene') || t.includes('sin gluten') || t.includes('trazas')) {
    return { icon: 'allergen', iconType: 'svg' };
  }
  if (t.includes('ingrediente') || t.includes('composición') || t.includes('receta')) {
    return { icon: 'ingredients', iconType: 'svg' };
  }
  if (t.includes('trigo') || t.includes('harina') || t.includes('gluten')) {
    return { icon: 'wheat', iconType: 'svg' };
  }
  if (t.includes('café') || t.includes('taza') || t.includes('bebida') || t.includes('grano') || t.includes('origen') || t.includes('tueste')) {
    return { icon: 'coffee', iconType: 'svg' };
  }
  if (t.includes('orgánic') || t.includes('vegano') || t.includes('natural') || t.includes('hoja') || t.includes('eco')) {
    return { icon: 'leaf', iconType: 'svg' };
  }
  if (t.includes('temperatur') || t.includes('caliente')) {
    return { icon: 'thermometer', iconType: 'svg' };
  }
  if (t.includes('salud') || t.includes('beneficio') || t.includes('amor') || t.includes('corazón')) {
    return { icon: 'heart', iconType: 'svg' };
  }

  // Try checking for emojis in the text itself
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}]/u;
  const match = text.match(emojiRegex);
  if (match) {
    return { icon: match[0], iconType: 'emoji' };
  }

  return { icon: '', iconType: 'none' };
}

export function renderFeatureIcon(icon?: string, iconType?: 'none' | 'svg' | 'emoji', text: string = "") {
  let activeIcon = icon;
  let activeType = iconType;

  // Fallback to auto-detection if none is specified
  if (!activeType || activeType === 'none' || !activeIcon) {
    const detected = autoDetectIcon(text);
    activeIcon = detected.icon;
    activeType = detected.iconType;
  }

  if (activeType === 'svg' && activeIcon && activeIcon in SPEC_ICONS) {
    return SPEC_ICONS[activeIcon as SpecIconKey].svg("w-4 h-4 shrink-0 text-gold mt-0.5");
  }

  if (activeType === 'emoji' && activeIcon) {
    return <span className="text-sm shrink-0 leading-none mr-1 mt-0.5">{activeIcon}</span>;
  }

  return <span className="text-gold mt-0.5 shrink-0">•</span>;
}

// A curated list of food-related emojis for the picker
export const FOOD_EMOJIS = [
  '🍞', '🥖', '🥐', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', 
  '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🥗', '🥘', '🍲', 
  '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍯', '🥛', '☕', '🍵', 
  '🧉', '🥤', '🧃', '🍺', '🍷', '🥂', '🍎', '🍋', '🍌', '🍇', 
  '🍓', '🫐', '🥑', '🥦', '🌽', '🌾', '🌱', '🌿', '🍂', '❤️', 
  '🔥', '✨', '⚠️', '⏲️', '🕒', '⚖️', '🛒', '📦', '🌍', '🏠'
];
