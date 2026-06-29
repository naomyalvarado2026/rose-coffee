import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGameWallet } from '../../../contexts/GameWalletContext';
import SEOHead from '../../../components/common/SEOHead';
import Confetti from '../../../components/games/common/Confetti';
import { audio } from '../../../utils/audioEngine';

const PRIZES = [
  { label: '50 Granos', value: 50, color: '#f59e0b' },
  { label: 'Nada', value: 0, color: '#94a3b8' },
  { label: '10 Granos', value: 10, color: '#f59e0b' },
  { label: 'Taza Gratis', value: 100, color: '#e11d48' },
  { label: 'Nada', value: 0, color: '#94a3b8' },
  { label: '500 Granos', value: 500, color: '#10b981' },
];

const SPIN_COST = 50;

const LuckyWheel: React.FC = () => {
  const { beans, addBeans } = useGameWallet();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState<typeof PRIZES[0] | null>(null);

  const spin = () => {
    if (isSpinning || beans < SPIN_COST) return;
    
    addBeans(-SPIN_COST);
    setIsSpinning(true);
    setPrize(null);
    audio.playPowerUp(); // or a spinning sound

    // Randomize
    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    const sliceAngle = 360 / PRIZES.length;
    // Calculate final rotation (add multiple full spins + target angle)
    const targetRotation = rotation + (360 * 5) + (360 - (prizeIndex * sliceAngle)) - (sliceAngle / 2);

    setRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const wonPrize = PRIZES[prizeIndex];
      setPrize(wonPrize);
      
      if (wonPrize.value > 0) {
        addBeans(wonPrize.value);
        audio.playCoin();
      } else {
        audio.playHurt();
      }
    }, 5000); // 5 seconds spin
  };

  return (
    <div className="min-h-screen pt-24 pb-8 px-4 lg:px-8 font-sans text-primary dark:text-stone-100 bg-stone-50 dark:bg-stone-900 flex flex-col items-center">
      <SEOHead 
        title="Ruleta de Granos | Rose Coffee" 
        description="Gira la ruleta y gana premios increíbles."
      />
      
      <Confetti active={!!prize && prize.value > 0} />

      <div className="w-full max-w-2xl mb-6 flex justify-between items-center px-2">
        <Link 
          to="/juegos" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-full shadow-sm hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Volver</span>
        </Link>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 rounded-full font-bold shadow-sm">
          <span>Tus Granos: {beans}</span>
        </div>
      </div>

      <div className="w-full max-w-2xl text-center mb-8">
        <h1 className="text-4xl font-serif font-bold text-rose-900 dark:text-rose-300 tracking-tight mb-2">
          Ruleta de la Suerte
        </h1>
        <p className="text-stone-600 dark:text-stone-400">
          Cuesta {SPIN_COST} Granos girar la ruleta. ¡Prueba tu suerte!
        </p>
      </div>

      <div className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center p-6 lg:p-8 relative">
        
        {/* Wheel container */}
        <div className="relative w-72 h-72 sm:w-96 sm:h-96">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 z-20 text-rose-600">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 22h20L12 2z" />
            </svg>
          </div>
          
          <motion.div 
            className="w-full h-full rounded-full border-8 border-stone-200 dark:border-stone-700 shadow-2xl relative overflow-hidden"
            animate={{ rotate: rotation }}
            transition={{ duration: 5, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {PRIZES.map((p, i) => {
              const rotationAngle = (i * 360) / PRIZES.length;
              return (
                <div 
                  key={i}
                  className="absolute top-0 right-0 w-1/2 h-1/2 origin-bottom-left flex items-center justify-center"
                  style={{ 
                    backgroundColor: p.color,
                    transform: `rotate(${rotationAngle}deg) skewY(${90 - (360/PRIZES.length)}deg)`,
                  }}
                >
                  <div 
                    className="absolute text-white font-bold text-sm sm:text-lg text-center"
                    style={{ transform: `skewY(-${90 - (360/PRIZES.length)}deg) rotate(${ (360/PRIZES.length)/2 }deg) translateY(-80px)` }}
                  >
                    {p.label}
                  </div>
                </div>
              );
            })}
          </motion.div>
          
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-stone-800 rounded-full shadow-lg border-4 border-stone-200 dark:border-stone-700 z-10 flex items-center justify-center">
            <Gift size={20} className="text-rose-500" />
          </div>
        </div>

        <button 
          onClick={spin}
          disabled={isSpinning || beans < SPIN_COST}
          className="mt-12 px-8 py-4 bg-rose-600 hover:bg-rose-500 disabled:bg-stone-400 text-white rounded-full font-bold text-xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Play fill="currentColor" />
          Girar Ruleta ({SPIN_COST})
        </button>

        <AnimatePresence>
          {prize && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-white dark:bg-stone-800 rounded-2xl shadow-xl text-center border-2 border-rose-500"
            >
              <h3 className="text-2xl font-bold mb-2">
                {prize.value > 0 ? '¡Felicidades!' : '¡Oh no!'}
              </h3>
              <p className="text-lg">
                {prize.value > 0 ? `Has ganado ${prize.label}` : 'No has ganado nada esta vez. ¡Sigue intentándolo!'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default LuckyWheel;
