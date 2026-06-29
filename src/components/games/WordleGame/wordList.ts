export const WORDS = [
  'HORNO',
  'GRANO',
  'TAZAS',
  'DULCE',
  'CREMA',
  'LECHE',
  'CACAO',
  'NEGRO',
  'TARTA',
  'SABOR',
  'CALOR',
  'AROMA',
  'MOLER',
  'GUSTO',
  'TAZON',
  'SUAVE',
  'POLVO',
  'BEBER',
  'PANES',
  'BAGEL',
  'DONAS',
  'MENTA',
  'HIELO',
  'LATTE',
  'MOKAS',
  'GOTAS',
  'SALUD',
  'RUTAS',
  'VERDE',
  'ROJOS',
  'ROSAS',
  'FRUTA',
  'PAUSA',
  'TRAGO',
  'VASOS',
  'MOLDE',
  'FRESA',
  'MORAS',
  'MIXTO',
  'CARNE',
  'SALAD'
];

export const VALID_GUESSES = new Set(WORDS); // You could expand this with a larger generic dictionary if you want to allow non-coffee guesses

export const getRandomWord = () => {
  const index = Math.floor(Math.random() * WORDS.length);
  return WORDS[index];
};
