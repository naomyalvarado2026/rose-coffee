import { motion } from 'framer-motion';
import { Sprout, CheckSquare, Flame, Coffee, Smile } from 'lucide-react';

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  {
    number: '01',
    title: 'Cultivo de Altura',
    description: 'Seleccionamos fincas en climas ecuatoriales ideales a más de 1,500 metros sobre el nivel del mar, asegurando una maduración lenta del grano.',
    icon: <Sprout className="w-6 h-6 text-coffee" />
  },
  {
    number: '02',
    title: 'Selección Rigurosa',
    description: 'Los productores cosechan a mano únicamente las cerezas en su punto óptimo de madurez, realizando una criba flotante para eliminar impurezas.',
    icon: <CheckSquare className="w-6 h-6 text-coffee" />
  },
  {
    number: '03',
    title: 'Tostado de Perfil',
    description: 'Tostamos artesanalmente en lotes pequeños en nuestro local de Milagro, desarrollando perfiles únicos que resaltan las notas florales y frutales.',
    icon: <Flame className="w-6 h-6 text-coffee" />
  },
  {
    number: '04',
    title: 'Preparación Precisa',
    description: 'Nuestros baristas muelen al instante y controlan minuciosamente la temperatura del agua y ratios de extracción para la taza perfecta.',
    icon: <Coffee className="w-6 h-6 text-coffee" />
  },
  {
    number: '05',
    title: 'Tu Experiencia Rose',
    description: 'Disfrutas de un café extraordinario, lleno de historia, aroma y sabor balanceado, ideal para acompañar con nuestra panadería de masa madre.',
    icon: <Smile className="w-6 h-6 text-coffee" />
  }
];

interface CoffeeJourneySectionProps {
  data?: {
    title?: string;
    subtitle?: string;
  };
}

export default function CoffeeJourneySection({ data }: CoffeeJourneySectionProps) {
  const title = data?.title || 'Del Grano a Tu Taza';
  const subtitle = data?.subtitle || 'Un viaje de dedicación y respeto por el origen que define el sabor de cada sorbo.';

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 space-y-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute right-0 top-1/2 w-80 h-80 bg-coffee/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="text-center max-w-2xl mx-auto space-y-3"
      >
        <span className="inline-block text-[10px] font-bold text-coffee uppercase tracking-widest border border-coffee/25 bg-coffee/5 px-4 py-1.5 rounded-full">
          Nuestra Filosofía
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-primary">
          {title}
        </h2>
        <p className="text-stone-500 text-sm md:text-base leading-relaxed font-light">
          {subtitle}
        </p>
      </motion.div>

      {/* Timeline Layout */}
      <div className="relative max-w-4xl mx-auto mt-16">
        {/* Central Vertical Line for Desktop */}
        <div className="absolute left-4 md:left-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-coffee/20 via-coffee/40 to-coffee/10 md:-translate-x-1/2" />

        <div className="space-y-12">
          {STEPS.map((step, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className={`flex flex-col md:flex-row items-start md:items-center relative ${
                  isEven ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Content Box */}
                <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${
                  isEven ? 'md:pl-12 text-left' : 'md:pr-12 md:text-right'
                }`}>
                  <div className="glass-card p-6 rounded-3xl relative inline-block text-left w-full max-w-md shadow-2xs hover:shadow-xs transition-shadow duration-300">
                    <span className="absolute -top-3 -left-3 md:-top-3 md:-left-3 bg-coffee text-white text-xs font-black w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                      {step.number}
                    </span>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-coffee/10 rounded-xl md:hidden">
                        {step.icon}
                      </div>
                      <h3 className="font-bold text-base text-primary">{step.title}</h3>
                    </div>
                    <p className="text-stone-500 text-xs leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Central Icon Circle */}
                <div className="absolute left-0 md:left-1/2 top-1 md:top-auto md:-translate-x-1/2 w-9 h-9 rounded-full bg-base border-2 border-coffee flex items-center justify-center shadow-md z-10">
                  <div className="w-5 h-5 flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>

                {/* Empty spacer for desktop symmetry */}
                <div className="hidden md:block w-1/2" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
