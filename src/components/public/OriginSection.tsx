import { motion } from 'framer-motion';
import { MapPin, ArrowUpRight, Compass, ShieldCheck } from 'lucide-react';
import originImg from '/coffee_origin_harvest.webp';

interface OriginSectionProps {
  data?: {
    title?: string;
    subtitle?: string;
    cover_image_url?: string | null;
  };
}

export default function OriginSection({ data }: OriginSectionProps) {
  const title = data?.title || 'Honramos el Origen de Cada Taza';
  const subtitle = data?.subtitle || 'No es solo café; es el fruto del esfuerzo de familias caficultoras en las cordilleras de Loja y Zaruma. Trabajamos mediante comercio justo directo, garantizando que cada grano sea retribuido con dignidad.';
  const imgUrl = data?.cover_image_url || originImg;

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Column: Visual & Data Cards */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative group"
        >
          {/* Main Image Container */}
          <div className="relative rounded-[32px] overflow-hidden aspect-4/3 shadow-xl border border-stone-200 dark:border-stone-700">
            <img
              src={imgUrl}
              alt="Cosecha de café en las montañas de Ecuador"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
            
            {/* Embedded Badge */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-white">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-gold">100% Ecuatoriano</p>
                <h3 className="text-xl font-bold font-sans">Origen Loja & Zaruma</h3>
              </div>
              <div className="bg-white dark:bg-stone-800/15 backdrop-blur-md border border-white/25 rounded-full p-2.5">
                <Compass className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Decorative Warm Orb behind */}
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-gold/10 blur-[80px] rounded-full pointer-events-none -z-10" />
        </motion.div>

        {/* Right Column: Narrative & Stats */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-8 text-left"
        >
          <div className="space-y-3">
            <span className="inline-block text-[10px] font-bold text-coffee dark:text-gold uppercase tracking-widest border border-coffee/25 bg-coffee/5 px-4 py-1.5 rounded-full">
              Nuestro Café Tiene Historia
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-gold leading-tight">
              {title}
            </h2>
            <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Technical Specs Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-stone-800/60 backdrop-blur-xs p-4 rounded-2xl border border-stone-200 dark:border-stone-700/80 flex items-start gap-3">
              <div className="p-2 bg-coffee/5 rounded-xl text-coffee dark:text-gold">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Región</h4>
                <p className="text-xs font-bold text-primary dark:text-stone-200 mt-0.5">Zaruma & Loja, Ecuador</p>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-800/60 backdrop-blur-xs p-4 rounded-2xl border border-stone-200 dark:border-stone-700/80 flex items-start gap-3">
              <div className="p-2 bg-coffee/5 rounded-xl text-coffee dark:text-gold">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Altura</h4>
                <p className="text-xs font-bold text-primary dark:text-stone-200 mt-0.5">1,650 - 1,800 msnm</p>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-800/60 backdrop-blur-xs p-4 rounded-2xl border border-stone-200 dark:border-stone-700/80 flex items-start gap-3">
              <div className="p-2 bg-coffee/5 rounded-xl text-coffee dark:text-gold">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Variedades</h4>
                <p className="text-xs font-bold text-primary dark:text-stone-200 mt-0.5">Bourbon Cidra, Typica</p>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-800/60 backdrop-blur-xs p-4 rounded-2xl border border-stone-200 dark:border-stone-700/80 flex items-start gap-3">
              <div className="p-2 bg-coffee/5 rounded-xl text-coffee dark:text-gold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Proceso</h4>
                <p className="text-xs font-bold text-primary dark:text-stone-200 mt-0.5">Lavado & Honey Artesanal</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-stone-500 dark:text-stone-400 text-xs italic leading-relaxed border-l-2 border-gold pl-4">
              "El tueste medio resalta una acidez cítrica brillante con notas persistentes a chocolate, caramelo y avellanas."
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
