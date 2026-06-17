import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatarUrl?: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Esteban Mendoza',
    location: 'Milagro, Ecuador',
    rating: 5,
    text: 'El café de especialidad de Rose Coffee es de otro nivel. Tienen una acidez equilibrada y unas notas frutales increíbles. Y el pan de masa madre es crujiente y esponjoso, como debe ser.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '2',
    name: 'Naomy Guerrero',
    location: 'Guayaquil, Ecuador',
    rating: 5,
    text: 'Increíble experiencia. Poder ver los productos en realidad aumentada 3D desde mi celular antes de comprar es genial, pero probarlos es aún mejor. El pan campesino es una adicción total.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '3',
    name: 'Carlos Ruiz',
    location: 'Milagro, Ecuador',
    rating: 5,
    text: 'Rose Coffee se ha convertido en mi parada diaria obligatoria. El servicio por WhatsApp es súper rápido y amable. La suscripción de café mensual es una maravilla para tener siempre granos frescos.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

export default function TestimonialsSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="text-center max-w-2xl mx-auto space-y-3"
      >
        <span className="inline-block text-[10px] font-bold text-coffee uppercase tracking-widest border border-coffee/25 bg-coffee/5 px-4 py-1.5 rounded-full">
          Opiniones
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-primary">
          Lo que dicen nuestros clientes
        </h2>
        <p className="text-stone-500 text-sm md:text-base leading-relaxed">
          Nuestra mayor satisfacción es brindar una experiencia premium en cada taza y bocado.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TESTIMONIALS.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="glass-card rounded-3xl p-6 flex flex-col justify-between relative"
          >
            <div className="absolute top-6 right-6 text-coffee/10">
              <Quote size={40} className="stroke-[3px]" />
            </div>

            <div className="space-y-4">
              {/* Rating stars */}
              <div className="flex gap-1 text-gold">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" className="stroke-none" />
                ))}
              </div>

              <p className="text-stone-600 text-sm leading-relaxed italic">
                "{testimonial.text}"
              </p>
            </div>

            <div className="flex items-center gap-3 pt-6 mt-6 border-t border-coffee/5">
              {testimonial.avatarUrl ? (
                <img
                  src={testimonial.avatarUrl}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover border border-coffee/10"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-coffee/10 flex items-center justify-center text-coffee font-bold text-sm">
                  {testimonial.name[0]}
                </div>
              )}
              <div className="text-left">
                <h4 className="font-bold text-xs text-primary">{testimonial.name}</h4>
                <p className="text-[10px] text-stone-400 font-medium">{testimonial.location}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
