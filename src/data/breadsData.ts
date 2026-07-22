export interface BreadItem {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  image: string;
  aspectRatio: string;
  description: string;
  fermentation: string;
  flourType: string;
  hydration: string;
  crumbType: string;
  crustType: string;
  flavorNotes: string[];
  pairing: {
    coffeeName: string;
    description: string;
  };
  price: number;
  badge?: string;
  arModel?: string;
}

export const BREADS_CATALOG: BreadItem[] = [
  {
    id: 'bread-1',
    number: '01',
    name: 'Hogaza Clásica de Masa Madre',
    subtitle: 'La Receta Madre Tradicional',
    image: '/fotos/panes/Pan 1.png',
    aspectRatio: '3/4',
    description: 'Nuestra hogaza insignia horneada a la piedra. Una masa madre natural cultivada y alimentada diariamente por más de 3 años en Milagro, ofreciendo un equilibrio perfecto entre acidezláctica sutil y dulzor de malta.',
    fermentation: '24 Horas en Frío',
    flourType: 'Trigo Orgánico de Piedra & Centeno 10%',
    hydration: '78%',
    crumbType: 'Alveolo Abierto & Elástico',
    crustType: 'Crocante, Dorada y Greñada en Cruz',
    flavorNotes: ['Trigo Tostado', 'Mantequilla Láctica', 'Fruto Seco Sutil'],
    pairing: {
      coffeeName: 'Espresso Zaruma Tradicional',
      description: 'El cuerpo denso del espresso resalta la caramelización de la corteza de la hogaza.'
    },
    price: 4.50,
    badge: 'Más Vendido'
  },
  {
    id: 'bread-2',
    number: '02',
    name: 'Hogaza Multigranos & Semillas',
    subtitle: 'Textura Tostada & Superalimento',
    image: '/fotos/panes/Pan 2.png',
    aspectRatio: '3/4',
    description: 'Incrustada en corteza con una mezcla dorada de sésamo negro, linaza dorada y pipas de girasol tostadas. Una hogaza rica en omega 3 con textura crujiente en cada bocado.',
    fermentation: '28 Horas',
    flourType: 'Integral Completa & Sésamo Tostado',
    hydration: '82%',
    crumbType: 'Miga Jugosa con Semillas Activas',
    crustType: 'Corteza Gruesa Caramelizada con Semillas',
    flavorNotes: ['Nuez Tostada', 'Sésamo', 'Malta de Centeno'],
    pairing: {
      coffeeName: 'Flat White Loja Bourbon',
      description: 'La sedosidad de la leche emulsionada armoniza con las notas avellanadas de las semillas.'
    },
    price: 5.20,
    badge: 'Alto en Fibra'
  },
  {
    id: 'bread-3',
    number: '03',
    name: 'Batard de Centeno & Trigo Integral',
    subtitle: 'Rústico de Sabor Profundo',
    image: '/fotos/panes/Pan 3.png',
    aspectRatio: '3/4',
    description: 'Elaborado con molienda entera de centeno y trigo de alta montaña. Ofrece un perfil complejo, ligeramente ácido y aromático, perfecto para lonjas con mantequilla salada o tostadas de aguacate.',
    fermentation: '30 Horas Lenta',
    flourType: 'Centeno Orgánico 30% & Trigo Integral',
    hydration: '80%',
    crumbType: 'Miga Densa y Mantecosa',
    crustType: 'Corteza Moscabada Rústica',
    flavorNotes: ['Especies Terrosas', 'Centeno Maduro', 'Cacao Salvaje'],
    pairing: {
      coffeeName: 'V60 Bourbon Honey',
      description: 'Las notas florales y frutales del café V60 equilibran la acidez terrosa del centeno.'
    },
    price: 4.80,
    badge: 'Artesanal Premium'
  },
  {
    id: 'bread-4',
    number: '04',
    name: 'Baguette Tradicional Salvaje',
    subtitle: 'Corteza Crujiente & Miga Ligera',
    image: '/fotos/panes/Pan 4.png',
    aspectRatio: '3/4',
    description: 'Formada a mano respetando los cortes diagonales franceses tradicionales. Masa fermentada con pre-fermento poolish y masa madre viva para lograr una ligereza aérea inigualable.',
    fermentation: '20 Horas',
    flourType: 'Trigo Fuerza Panificable 100%',
    hydration: '75%',
    crumbType: 'Alveolado Grande & Algodonoso',
    crustType: 'Ultra Crujiente Resonante',
    flavorNotes: ['Miga Dulce', 'Cereal Recién Horneado'],
    pairing: {
      coffeeName: 'Latte Helado Rose Special',
      description: 'El contraste entre el pan caliente recien cortado y el café helado cremoso.'
    },
    price: 3.50,
    badge: 'Crocante Extra'
  },
  {
    id: 'bread-5',
    number: '05',
    name: 'Pan de Campo Cacao & Espresso',
    subtitle: 'Edición Firma Rose Coffee',
    image: '/fotos/panes/Pan 5.png',
    aspectRatio: '3/4',
    description: 'Una creación exclusiva de nuestra casa. Infusionamos la masa con una reducción concentrada de espresso Zaruma y trozos de cacao amargo 70% ecuatoriano sin azúcares añadidos.',
    fermentation: '24 Horas',
    flourType: 'Trigo Especial con Cacao Puro & Café',
    hydration: '78%',
    crumbType: 'Miga Oscura Aromática y Esponjosa',
    crustType: 'Corteza Tostada Intensa',
    flavorNotes: ['Chocolate Oscuro 70%', 'Espresso', 'Caramelo Tostado'],
    pairing: {
      coffeeName: 'Cold Brew Nitro',
      description: 'Maridaje de intensidad pura: el nitrógeno amplifica el retrogusto chocolatoso del pan.'
    },
    price: 5.80,
    badge: 'Exclusivo Rose Coffee'
  },
  {
    id: 'bread-6',
    number: '06',
    name: 'Brioche de Masa Madre con Mantequilla',
    subtitle: 'Suavidad Deshebrable & Dorado Perfecto',
    image: '/fotos/panes/Pan 6.png',
    aspectRatio: '3/4',
    description: 'Enriquecido con mantequilla artesanal pura de campo manabita y yemas de huevo campesino. Su fermentación con levadura salvaje le da una digestibilidad superior sin pesadez.',
    fermentation: '18 Horas',
    flourType: 'Trigo Fino & Mantequilla 25%',
    hydration: 'Leche & Yemas',
    crumbType: 'Deshebrable, Miga Sedosa Amarilla',
    crustType: 'Fina, Brillante y Dorada al Huevo',
    flavorNotes: ['Mantequilla Fresca', 'Vainilla Natural', 'Brioche Dulce'],
    pairing: {
      coffeeName: 'Cappuccino Canela & Vainilla',
      description: 'Complemento indulgente para tardes de café y repostería artesanal.'
    },
    price: 4.20,
    badge: 'Textura Sedosa'
  },
  {
    id: 'bread-7',
    number: '07',
    name: 'Hogaza de Aceitunas & Romero',
    subtitle: 'Sabor Mediterráneo de Autor',
    image: '/fotos/panes/Pan 7.png',
    aspectRatio: '3/4',
    description: 'Cargado de aceitunas kalamata enteras deshuesadas y romero fresco recién cortado. Un pan salado jugoso perfecto para acompañar sopas, pastas o tablas de quesos.',
    fermentation: '24 Horas',
    flourType: 'Trigo Orgánico & Aceite de Oliva Extra Virgen',
    hydration: '80%',
    crumbType: 'Miga Jugosa Salpicada de Olivas',
    crustType: 'Corteza Espolvoreada de Harina y Hierbas',
    flavorNotes: ['Aceituna Negra', 'Romero', 'Aceite de Oliva'],
    pairing: {
      coffeeName: 'Espresso Doble Especial',
      description: 'Las notas saladas y herbales del pan limpian el paladar para un espresso intenso.'
    },
    price: 5.50,
    badge: 'Gourmet Salado'
  },
  {
    id: 'bread-8',
    number: '08',
    name: 'Hogaza Corona de Espelta & Miel',
    subtitle: 'Harina Ancestral & Dulzor Natural',
    image: '/fotos/panes/Pan 8.png',
    aspectRatio: '3/4',
    description: 'Formado con espelta antigua de fácil digestión y un toque sutil de miel pura de abeja de montaña. Tallado con un greñado en espiga de trigo espectacular.',
    fermentation: '26 Horas',
    flourType: 'Espelta Orgánica 50% & Miel Pura',
    hydration: '77%',
    crumbType: 'Miga Dorada Tierna y Digestiva',
    crustType: 'Greñado Tallado en Espiga',
    flavorNotes: ['Miel de Abeja', 'Nuez Silvestre', 'Espelta Tostada'],
    pairing: {
      coffeeName: 'Americano Zaruma V60',
      description: 'El perfil limpio del americano deja relucir el dulzor natural de la espelta y la miel.'
    },
    price: 5.00,
    badge: 'Harina Ancestral'
  }
];
