import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Shield, Sparkles, ArrowRight, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function RoseClubSection() {
  const { user } = useAuthStore();
  const [points, setPoints] = useState<number | null>(null);
  const [loadingPoints, setLoadingPoints] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchPoints = async () => {
      setLoadingPoints(true);
      try {
        const { data, error } = await supabase
          .from('loyalty_points')
          .select('points_balance')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!error && data) {
          setPoints(data.points_balance);
        } else {
          setPoints(0);
        }
      } catch (err) {
        console.error('Error fetching loyalty points:', err);
      } finally {
        setLoadingPoints(false);
      }
    };
    fetchPoints();
  }, [user]);

  const tiers = [
    { points: 100, reward: 'Espresso de Especialidad', desc: 'Disfruta de cualquier bebida de espresso a base de nuestro café de origen.', icon: '☕' },
    { points: 250, reward: 'Pan de Masa Madre Rústico', desc: 'Una hogaza caliente recién horneada del día con 24h de fermentación lenta.', icon: '🍞' },
    { points: 500, reward: 'Bolsa de Café de Origen (400g)', desc: 'Elige tu café favorito en grano o molido directo de las cordilleras de Loja/Zaruma.', icon: '🎒' },
    { points: 1000, reward: 'Desayuno Gourmet & Cata Privada', desc: 'Una experiencia sensorial guiada para dos personas con nuestro barista de especialidad.', icon: '✨' }
  ];

  // Calculate progress to next tier
  const getNextTier = () => {
    if (points === null) return tiers[0];
    const next = tiers.find(t => t.points > points);
    return next || tiers[tiers.length - 1];
  };

  const nextTier = getNextTier();
  const progressPercent = points !== null ? Math.min((points / nextTier.points) * 100, 100) : 0;

  return (
    <section id="rose-club" className="max-w-7xl mx-auto px-6 py-16 scroll-mt-20">
      <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white rounded-[40px] p-8 md:p-14 shadow-2xl relative overflow-hidden border border-white/5">
        {/* Glow Ambient Orbs */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-[300px] h-[300px] bg-coffee/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Loyalty Info */}
          <div className="lg:col-span-5 text-left space-y-6">
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold border border-gold/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-xs">
              <Sparkles size={12} className="animate-pulse" />
              <span>Fidelización Rose Club</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Cada Sorbo Te Acerca a un Regalo
            </h2>
            
            <p className="text-stone-400 text-sm md:text-base leading-relaxed font-light">
              Únete gratis a nuestro club de fidelización. Acumula **10 puntos por cada $1 de compra** en nuestra tienda o cafetería y canjéalos por tus productos favoritos recién salidos del horno.
            </p>

            {/* User points segment */}
            {user ? (
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4 backdrop-blur-md">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">Tu Saldo Actual</span>
                    <span className="text-3xl font-extrabold text-gold tracking-tight">
                      {loadingPoints ? '...' : `${points || 0} pts`}
                    </span>
                  </div>
                  <div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
                    <Award size={22} />
                  </div>
                </div>

                {points !== null && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-stone-400">
                      <span>Progreso para {nextTier.reward}</span>
                      <span className="font-bold text-gold">{points} / {nextTier.points} pts</span>
                    </div>
                    <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div 
                        className="bg-gold h-full rounded-full transition-all duration-700 ease-out" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="flex gap-4 items-start text-xs text-stone-400">
                  <div className="p-2 bg-white/5 border border-white/10 rounded-xl text-gold shrink-0">
                    <Shield size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-0.5">Seguro & Automático</h4>
                    <p>Los puntos se añaden automáticamente a tu cuenta con cada pedido finalizado por WhatsApp o web.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1 bg-gold hover:bg-yellow-600 text-stone-950 font-bold text-xs px-6 py-3 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Crear Cuenta / Iniciar Sesión
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Reward Milestones Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tiers.map((tier, idx) => (
              <motion.div
                key={tier.points}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="bg-white/5 border border-white/10 hover:border-gold/30 p-6 rounded-3xl text-left flex flex-col justify-between space-y-4 hover:bg-white/8 transition-all duration-300 group shadow-xxs"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-gold bg-gold/10 px-2.5 py-1 rounded-md border border-gold/15 group-hover:scale-105 transition-transform">
                    {tier.points} PTS
                  </span>
                  <span className="text-2xl">{tier.icon}</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-white">{tier.reward}</h3>
                  <p className="text-stone-400 text-xs leading-relaxed font-light">{tier.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
