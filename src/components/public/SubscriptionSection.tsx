import { useState } from 'react';
import { Check, Calendar, CreditCard, Sparkles, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SubscriptionSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'biweekly'>('monthly');

  const plans = [
    {
      name: 'Plan Aficionado',
      priceMonthly: 12.50,
      priceBiweekly: 7.00,
      description: 'Perfecto para quienes toman una taza ocasional de café excelente en casa.',
      benefits: [
        '1 Bolsa de Café de Especialidad (400g) al mes',
        'Elige entre molienda personalizada o grano',
        'Envío a domicilio incluido en Milagro',
        'Puntos Rose Club acumulables (120 pts)',
      ],
      popular: false,
      whatsappText: '¡Hola Rose Coffee! Me gustaría suscribirme al *Plan Aficionado* para recibir granos frescos. Por favor, guíenme con la activación.'
    },
    {
      name: 'Plan Entusiasta',
      priceMonthly: 24.00,
      priceBiweekly: 13.00,
      description: 'Ideal para parejas o tomadores diarios de café que disfrutan la frescura constante.',
      benefits: [
        '2 Bolsas de Café de Especialidad (400g) al mes',
        'Alterna entre orígenes Loja y Zaruma',
        '10% de descuento en repostería y panes físicos',
        'Envío a domicilio incluido',
        'Puntos Rose Club acumulables (240 pts)',
      ],
      popular: true,
      whatsappText: '¡Hola Rose Coffee! Me gustaría suscribirme al *Plan Entusiasta* (el más elegido). Por favor, guíenme con los detalles para la activación.'
    },
    {
      name: 'Plan Coffeelover Experto',
      priceMonthly: 45.00,
      priceBiweekly: 24.50,
      description: 'La experiencia definitiva para familias cafeteras u oficinas pequeñas.',
      benefits: [
        '4 Bolsas de Café de Especialidad (400g) al mes',
        'Tuestes exclusivos para miembros del club',
        '20% de descuento en panes y repostería artesanal',
        'Asesoría técnica de preparación por barista',
        'Puntos Rose Club acumulables (450 pts)',
      ],
      popular: false,
      whatsappText: '¡Hola Rose Coffee! Me gustaría suscribirme al *Plan Coffeelover Experto* para recibir café de especialidad recurrente. Por favor, guíenme con los detalles.'
    }
  ];

  const handleSubscribe = (whatsappText: string) => {
    const encoded = encodeURIComponent(whatsappText);
    window.open(`https://wa.me/593980372113?text=${encoded}`, '_blank');
  };

  return (
    <section id="subscriptions" className="max-w-7xl mx-auto px-6 py-16 text-left scroll-mt-20">
      <div className="space-y-12">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-coffee/5 text-coffee border border-coffee/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
            <Calendar size={12} className="text-coffee animate-pulse" />
            <span>Suscripciones Mensuales</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary">
            Café de Especialidad en Piloto Automático
          </h2>
          <p className="text-stone-500 text-sm md:text-base leading-relaxed font-light">
            Recibe granos recién tostados directamente en tu puerta. Olvídate de quedarte sin café y disfruta de descuentos exclusivos en panadería de masa madre.
          </p>

          {/* Toggle Billing Frequency */}
          <div className="flex items-center justify-center pt-2">
            <div className="bg-stone-100 p-1.5 rounded-2xl border border-stone-250 flex gap-1">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-coffee text-[#faf2e7] shadow-sm'
                    : 'text-stone-500 hover:text-stone-850'
                }`}
              >
                Entrega Mensual
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('biweekly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  billingCycle === 'biweekly'
                    ? 'bg-coffee text-[#faf2e7] shadow-sm'
                    : 'text-stone-500 hover:text-stone-850'
                }`}
              >
                Entrega Quincenal
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => {
            const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceBiweekly;
            const cycleText = billingCycle === 'monthly' ? 'mes' : 'quincena';

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`bg-white rounded-[32px] border p-8 flex flex-col justify-between relative shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${
                  plan.popular 
                    ? 'border-coffee border-2 shadow-sm' 
                    : 'border-stone-200'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-coffee text-[#faf2e7] text-[9px] font-bold px-3 py-1 rounded-full border border-coffee-dark uppercase tracking-widest shadow-sm flex items-center gap-1">
                    <Sparkles size={10} className="fill-[#faf2e7]" />
                    Más Elegido
                  </span>
                )}

                <div className="space-y-6">
                  {/* Plan Header */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-primary">{plan.name}</h3>
                    <p className="text-stone-500 text-xs leading-relaxed font-light">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 py-2 border-y border-stone-100">
                    <span className="text-3xl font-black text-primary font-sans">${price.toFixed(2)}</span>
                    <span className="text-stone-400 text-xs font-medium uppercase">/ {cycleText}</span>
                  </div>

                  {/* Benefits List */}
                  <ul className="space-y-3">
                    {plan.benefits.map((benefit, bIdx) => (
                      <li key={bIdx} className="flex gap-2.5 items-start text-xs text-stone-600 font-medium">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="pt-8">
                  <button
                    type="button"
                    onClick={() => handleSubscribe(plan.whatsappText)}
                    className={`w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer ${
                      plan.popular
                        ? 'bg-coffee hover:bg-coffee-dark text-[#faf2e7]'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    <MessageCircle size={15} />
                    Suscribirme por WhatsApp
                  </button>
                  <p className="text-[10px] text-stone-400 text-center mt-2.5 font-medium flex items-center justify-center gap-1">
                    <CreditCard size={11} />
                    Soporta transferencia y efectivo local
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
