import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Check, ShieldCheck, Sparkles } from 'lucide-react';
import MagneticButton from '../animations/MagneticButton';

export default function CoffeeSubscription() {
  const [selectedPlan, setSelectedPlan] = useState<'quincenal' | 'mensual' | 'bimestral'>('mensual');

  const plans = [
    {
      id: 'quincenal',
      name: 'Plan Quincenal',
      price: '$22.00',
      period: 'quincena',
      description: 'Recibe 2 bolsas de 400g recién tostadas cada 15 días.',
      benefits: ['Café 100% fresco garantizado', 'Envío prioritario gratuito', 'Acceso a ediciones limitadas'],
    },
    {
      id: 'mensual',
      name: 'Plan Mensual',
      price: '$39.00',
      period: 'mes',
      description: 'Recibe 2 bolsas de 400g recién tostadas al mes.',
      benefits: ['El plan favorito del Rose Club', 'Envío gratuito a domicilio', 'Regalo sorpresa el tercer mes'],
      popular: true,
    },
    {
      id: 'bimestral',
      name: 'Plan Bimestral',
      price: '$36.50',
      period: '2 meses',
      description: 'Recibe 2 bolsas de 400g recién tostadas cada 2 meses.',
      benefits: ['Ideal para consumo moderado', 'Tostado a tu elección', 'Pausa o cancela online'],
    },
  ];

  const handleSubscribe = () => {
    const planName = plans.find(p => p.id === selectedPlan)?.name;
    toast.success(`¡Gracias por suscribirte al ${planName}! Nos pondremos en contacto contigo para coordinar tu primera entrega.`);
  };

  return (
    <div id="coffee_subscription" className="max-w-6xl mx-auto bg-[#faf2e7]/60 backdrop-blur-xs rounded-[32px] border border-coffee/10 p-6 md:p-12 shadow-sm relative overflow-hidden text-left space-y-8 select-none">
      {/* Background Orbs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gold/5 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-coffee/5 blur-[100px] pointer-events-none" />

      <div className="max-w-3xl space-y-3 relative z-10">
        <span className="inline-flex items-center gap-1.5 bg-coffee/10 text-coffee border border-coffee/15 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          <Sparkles size={12} />
          Suscripción Rose Coffee
        </span>
        <h2 className="text-2xl md:text-4xl font-extrabold text-[#021a54] tracking-tight font-sans">
          Asegura tu café favorito siempre fresco.
        </h2>
        <p className="text-stone-550 text-xs md:text-sm font-medium leading-relaxed">
          Suscríbete a nuestros planes exclusivos y recibe café de especialidad recién tostado directamente en tu puerta. Cancela o modifica tu plan cuando quieras sin cargos adicionales.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 items-stretch">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <motion.div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id as any)}
              whileHover={{ y: -4 }}
              className={`bg-white rounded-3xl p-6 flex flex-col justify-between cursor-pointer border-2 transition-all relative ${
                isSelected 
                  ? 'border-[#6b3a0e] shadow-md' 
                  : 'border-stone-150 hover:border-stone-250 shadow-xxs'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-6 bg-gold text-[#faf2e7] px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xs">
                  Recomendado
                </span>
              )}
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-extrabold text-base md:text-lg text-[#021a54]">{plan.name}</h3>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected ? 'border-[#6b3a0e] bg-[#6b3a0e] text-[#faf2e7]' : 'border-stone-300'
                  }`}>
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>

                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-2xl md:text-3xl font-black text-stone-850">{plan.price}</span>
                  <span className="text-xs text-stone-400 font-bold uppercase">/ {plan.period}</span>
                </div>

                <p className="text-stone-500 text-xs font-medium leading-relaxed">
                  {plan.description}
                </p>

                <ul className="space-y-2.5 pt-4 border-t border-stone-100">
                  {plan.benefits.map((b, i) => (
                    <li key={i} className="flex gap-2 items-center text-stone-600 text-xs font-medium">
                      <div className="w-4.5 h-4.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center shrink-0">
                        <Check size={10} strokeWidth={3.5} />
                      </div>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-coffee/10 relative z-10">
        <div className="flex items-center gap-2.5 text-stone-550 text-xs font-bold text-left">
          <ShieldCheck className="text-coffee shrink-0" size={20} />
          <span>Sin contratos a largo plazo. Cancela cuando quieras.</span>
        </div>
        
        <MagneticButton>
          <button
            onClick={handleSubscribe}
            className="px-8 py-3.5 bg-coffee hover:bg-coffee-dark text-[#faf2e7] rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            Suscribirme Ahora
          </button>
        </MagneticButton>
      </div>
    </div>
  );
}
