import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy, Coffee, Cookie, CupSoda, Cake, Croissant, Milk, GlassWater, Flame } from 'lucide-react';
import { useGameWallet } from '../../../contexts/GameWalletContext';
import SEOHead from '../../../components/common/SEOHead';
import Confetti from '../../../components/games/common/Confetti';
import { audio } from '../../../utils/audioEngine';

interface Card {
  id: number;
  iconId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const CARD_ICONS = [
  { id: 1, Icon: Coffee, color: 'text-amber-700 dark:text-amber-500' },
  { id: 2, Icon: Croissant, color: 'text-orange-500 dark:text-orange-400' },
  { id: 3, Icon: Cookie, color: 'text-yellow-600 dark:text-yellow-500' },
  { id: 4, Icon: CupSoda, color: 'text-sky-500 dark:text-sky-400' },
  { id: 5, Icon: Cake, color: 'text-pink-500 dark:text-pink-400' },
  { id: 6, Icon: Milk, color: 'text-blue-500 dark:text-white' },
  { id: 7, Icon: GlassWater, color: 'text-cyan-500 dark:text-cyan-300' },
  { id: 8, Icon: Flame, color: 'text-red-500 dark:text-red-400' },
];

const MemoryCafe: React.FC = () => {
  const [cards, setCards] = useState<Card[]>(() => {
    return [...CARD_ICONS, ...CARD_ICONS]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        id: index,
        iconId: item.id,
        isFlipped: false,
        isMatched: false
      }));
  });
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [bestScore, setBestScore] = useState<number>(() => {
    const saved = localStorage.getItem('memory_cafe_best');
    return saved ? parseInt(saved, 10) : 0;
  });
  const { addBeans } = useGameWallet();

  const initializeGame = useCallback(() => {
    // Create pairs and shuffle
    const newCards: Card[] = [...CARD_ICONS, ...CARD_ICONS]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        id: index,
        iconId: item.id,
        isFlipped: false,
        isMatched: false
      }));

    setCards(newCards);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setTime(0);
    setIsGameWon(false);
    setIsPlaying(false);
    setIsLocked(false);
  }, []);

  useEffect(() => {
    let interval: number;
    if (isPlaying && !isGameWon) {
      interval = window.setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isGameWon]);

  const handlePeek = () => {
    if (isLocked || isGameWon || cards.every(c => c.isMatched)) return;
    setIsLocked(true);
    audio.playPowerUp();
    
    // Temporarily flip all unmatched
    const peekCards = cards.map(c => c.isMatched ? c : { ...c, isFlipped: true });
    setCards(peekCards);
    
    setTimeout(() => {
      setCards(prev => prev.map((c, i) => 
        c.isMatched ? c : { ...c, isFlipped: flippedIndices.includes(i) }
      ));
      setIsLocked(false);
    }, 1500);
  };


  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCardClick = (index: number) => {
    if (isLocked) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    if (!isPlaying) setIsPlaying(true);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);
    
    // Flip visually immediately
    const updatedCards = [...cards];
    updatedCards[index].isFlipped = true;
    setCards(updatedCards);
    audio.playJump();

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves(m => m + 1);
      
      const [firstIndex, secondIndex] = newFlipped;
      if (cards[firstIndex].iconId === cards[secondIndex].iconId) {
        // Match!
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[secondIndex].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setMatches(m => m + 1);
          setIsLocked(false);
          audio.playCoin();
          
          if (matches + 1 === CARD_ICONS.length) {
            handleWin();
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const handleWin = () => {
    setIsGameWon(true);
    setIsPlaying(false);
    audio.playPowerUp();
    
    // Calculate a score based on time and moves. Lower is better, but let's make a positive score
    // Base 10000 - (time * 10) - (moves * 50)
    let newScore = 10000 - (time * 10) - (moves * 50);
    if (newScore < 0) newScore = 0;
    
    // Award beans
    const awardedBeans = Math.max(10, Math.floor(newScore / 100));
    addBeans(awardedBeans);

    if (!bestScore || newScore > bestScore) {
      setBestScore(newScore);
      localStorage.setItem('memory_cafe_best', newScore.toString());
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-8 px-4 lg:px-8 font-sans text-primary dark:text-stone-100 bg-stone-50 dark:bg-stone-900 flex flex-col">
      <SEOHead 
        title="Memory Café | Rose Coffee" 
        description="Pon a prueba tu memoria con este ligero y relajante juego estilo Memory Match de Rose Coffee."
      />
      
      <Confetti active={isGameWon} />

      <div className="max-w-xl mx-auto w-full flex-1 flex flex-col justify-center">
        <Link 
          to="/juegos" 
          className="inline-flex items-center gap-2 text-primary/70 dark:text-stone-400 hover:text-coffee dark:hover:text-gold mb-4 transition-colors font-semibold text-sm uppercase tracking-wider"
        >
          <ArrowLeft size={16} /> Volver
        </Link>
        
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-6 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1 text-coffee dark:text-gold">Memory Café</h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 hidden sm:block">Encuentra los pares rápido.</p>
          </div>
          
          <div className="flex gap-4 bg-white dark:bg-stone-800 p-2 sm:p-3 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700">
            <div className="text-center px-2">
              <div className="text-[10px] sm:text-xs uppercase font-bold text-stone-500 dark:text-stone-400 tracking-wider mb-0.5">Movs</div>
              <div className="text-lg font-bold font-mono">{moves}</div>
            </div>
            <div className="text-center px-2">
              <div className="text-[10px] sm:text-xs uppercase font-bold text-stone-500 dark:text-stone-400 tracking-wider mb-0.5">Tiempo</div>
              <div className="text-lg font-bold font-mono">{formatTime(time)}</div>
            </div>
            {bestScore !== null && (
              <div className="text-center px-2 text-gold">
                <div className="text-[10px] sm:text-xs uppercase font-bold tracking-wider mb-0.5 flex justify-center items-center gap-1"><Trophy size={10}/> Mejor</div>
                <div className="text-lg font-bold font-mono">{bestScore}</div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <button 
            onClick={handlePeek}
            disabled={isLocked || isGameWon || cards.every(c => c.isMatched)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 rounded-full font-bold text-sm transition-colors disabled:opacity-50"
          >
            <RotateCcw size={16} /> Vistazo Mágico
          </button>
        </div>

        {/* Game Grid */}
        <div className="relative flex-1 w-full max-h-[60vh] flex items-center justify-center">
          <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4 w-full h-full max-w-[500px] max-h-[500px] aspect-square mx-auto">
            {cards.map((card, index) => {
              const iconData = CARD_ICONS.find(i => i.id === card.iconId);
              const Icon = iconData?.Icon;
              
              return (
                <div 
                  key={card.id}
                  className="relative aspect-square cursor-pointer [perspective:1000px]"
                  onClick={() => handleCardClick(index)}
                >
                  <motion.div
                    className="w-full h-full relative [transform-style:preserve-3d]"
                    animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    {/* Front of card (hidden side) */}
                    <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-coffee to-amber-900 dark:from-stone-700 dark:to-stone-800 rounded-full shadow-md border-4 border-amber-950/20 dark:border-stone-900/50 flex items-center justify-center hover:scale-[1.02] transition-transform">
                      <div className="absolute inset-2 rounded-full border-2 border-white/10" />
                      <div className="w-8 h-8 md:w-12 md:h-12 border-2 border-white/20 rounded-full border-dashed opacity-50" />
                    </div>
                    
                    {/* Back of card (revealed side) */}
                    <div 
                      className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white dark:bg-stone-800 rounded-full shadow-lg border-4 border-stone-200 dark:border-stone-600 flex items-center justify-center overflow-hidden"
                    >
                      <div className="absolute inset-1 rounded-full border border-stone-100 dark:border-stone-700" />
                      {Icon && (
                        <motion.div
                          initial={false}
                          animate={card.isMatched ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon size={48} className={`${iconData?.color} drop-shadow-sm ${card.isMatched ? 'opacity-50' : 'opacity-100'}`} strokeWidth={1.5} />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>

          <AnimatePresence>
            {isGameWon && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-3xl"
              >
                <div className="bg-white dark:bg-stone-800 p-8 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-700 text-center max-w-sm w-full mx-4">
                  <motion.div 
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    className="mb-4 flex justify-center"
                  >
                    <Trophy size={64} className="text-gold drop-shadow-md" />
                  </motion.div>
                  <h2 className="text-3xl font-extrabold mb-2">¡Excelente!</h2>
                  <p className="text-stone-600 dark:text-stone-400 mb-6 font-medium">
                    {bestScore !== null ? `Puntuación: ${bestScore}` : '¡Gran trabajo!'} <br/>
                    <span className="text-coffee dark:text-gold flex items-center justify-center gap-1 mt-2">
                      <Coffee size={16}/> +{Math.max(10, Math.floor(Math.max(0, 10000 - (time * 10) - (moves * 50)) / 100))} Granos
                    </span>
                  </p>
                  <button 
                    onClick={initializeGame}
                    className="w-full bg-coffee hover:bg-coffee-dark text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md group"
                  >
                    <RotateCcw size={18} className="group-hover:-rotate-90 transition-transform duration-300" /> Jugar de Nuevo
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Global CSS for backface visibility fallback */}
      <style>{`
        .backface-hidden {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
};

export default MemoryCafe;
