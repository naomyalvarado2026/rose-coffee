import React from 'react';
import { motion } from 'framer-motion';
import { TypewriterEffect } from './TypewriterEffect';

export interface TypographySpec {
  name: string;
  category: string;
  weights: string;
  specimen: string;
  fontFamilyClass?: string;
  useTypewriter?: boolean;
  customPhrases?: string[];
}

const professorPhrases = [
  "Paola, la mejor directora de la carrera de multimedia.",
  "Usiña, el mejor profesor, siempre inspirando a sus alumnos.",
  "Victor, el mejor profesor de diseño e interactividad.",
  "Ana Clara, la mejor profesora, llena de pasión por enseñar.",
  "Bolívar, un profesor excelente y guía invaluable.",
  "Paola, una profesora inspiradora y líder excepcional.",
  "Usiña, maestro de la creatividad y la innovación.",
  "Victor, un genio creativo y mentor excepcional.",
  "Ana Clara, transmitiendo arte y conocimiento en cada clase.",
  "Bolívar, el mejor profesor, estructurando mentes creativas.",
  "Paola, guiando con visión y excelencia la carrera de multimedia.",
  "Usiña, un gran profesor que transforma la enseñanza en arte.",
  "Victor, impulsando el talento de cada estudiante.",
  "Ana Clara, una docente que deja huella en sus alumnos.",
  "Bolívar, pilar fundamental en nuestra formación académica."
];

const interPhrases = [
  "Inter garantiza una legibilidad perfecta en cualquier pantalla.",
  "Diseño limpio y neutro, ideal para interfaces de usuario.",
  "La mejor opción para una experiencia digital impecable.",
  "Versatilidad absoluta, desde textos largos hasta microcopias.",
  "Elegancia, claridad y funcionalidad en cada carácter."
];

interface TypographySectionProps {
  fonts?: TypographySpec[];
}

const defaultFonts: TypographySpec[] = [
  {
    name: 'Sunday Magic',
    category: 'Primaria (Display)',
    weights: 'Regular',
    specimen: 'El veloz murciélago hindú comía feliz cardillo y kiwi.',
    fontFamilyClass: 'font-sunday',
    useTypewriter: true,
    customPhrases: professorPhrases
  },
  {
    name: 'Inter',
    category: 'Secundaria (Sans-Serif)',
    weights: 'Regular, Medium, SemiBold, Bold',
    specimen: 'El veloz murciélago hindú comía feliz cardillo y kiwi. La cigüeña tocaba el saxofón detrás del palenque de paja.',
    fontFamilyClass: 'font-sans',
    useTypewriter: true,
    customPhrases: interPhrases
  }
];

export const TypographySection: React.FC<TypographySectionProps> = ({ fonts = defaultFonts }) => {
  const displayFonts = fonts && fonts.length > 0 ? fonts : defaultFonts;

  return (
    <section className="py-24 bg-brand-base dark:bg-stone-950 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <span className="inline-block text-[10px] font-bold text-coffee dark:text-gold uppercase tracking-widest border border-coffee/25 bg-coffee/5 px-4 py-1.5 rounded-full mb-4">
            Tipografía
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-primary dark:text-stone-100 mb-6">
            Fuentes Corporativas
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-lg">
            Selección tipográfica diseñada para garantizar legibilidad, modernidad y transmitir los valores de nuestra marca en todos los puntos de contacto.
          </p>
        </div>

        <div className="space-y-12">
          {displayFonts.map((font, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white dark:bg-stone-900 rounded-[32px] border border-stone-200 dark:border-stone-800 p-8 md:p-12 shadow-sm hover:shadow-xl relative overflow-hidden group transition-shadow duration-500"
            >
              {/* Background decorative letter */}
              <div className="absolute -right-12 -top-24 text-[300px] font-black text-stone-50 dark:text-stone-800/30 select-none pointer-events-none group-hover:scale-110 transition-transform duration-700">
                Aa
              </div>
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
                <div className="md:col-span-4 space-y-6">
                  <div>
                    <h3 className="text-4xl md:text-5xl font-bold text-primary dark:text-stone-100 mb-2">
                      {font.name}
                    </h3>
                    <span className="text-sm font-bold text-gold uppercase tracking-widest">
                      {font.category}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-2">
                      Pesos Utilizados
                    </p>
                    <p className="text-stone-600 dark:text-stone-300 font-medium">
                      {font.weights}
                    </p>
                  </div>
                  
                  <div className={`pt-4 border-t border-stone-100 dark:border-stone-800 ${font.fontFamilyClass || ''}`}>
                    <p className="text-xl font-medium text-stone-800 dark:text-stone-200 break-all leading-relaxed tracking-wide">
                      Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789
                    </p>
                  </div>
                </div>

                <div className="md:col-span-8 flex flex-col justify-center">
                  <div className="space-y-8">
                    <div className={font.fontFamilyClass || ''}>
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-4 font-sans">
                        Muestra de Texto
                      </p>
                      <p className={`text-2xl md:text-4xl text-primary dark:text-stone-100 leading-tight min-h-[120px] ${font.fontFamilyClass === 'font-sans' ? 'font-semibold md:text-3xl' : 'font-bold'}`}>
                        {font.useTypewriter ? (
                          <TypewriterEffect phrases={font.customPhrases || [font.specimen]} pauseDuration={2500} />
                        ) : (
                          font.specimen
                        )}
                      </p>
                    </div>
                    <div className={font.fontFamilyClass || ''}>
                      <p className="text-lg md:text-xl text-stone-500 dark:text-stone-400 font-normal leading-relaxed">
                        {font.specimen}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
