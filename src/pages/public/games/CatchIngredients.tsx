import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RefreshCw, Trophy, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGameWallet } from '../../../contexts/GameWalletContext';
import SEOHead from '../../../components/common/SEOHead';
import Confetti from '../../../components/games/common/Confetti';
import { audio } from '../../../utils/audioEngine';

// Types
type ItemType = 'bean' | 'milk' | 'choco' | 'bug' | 'rock';
interface FallingItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  speed: number;
}

const ITEMS: Record<ItemType, { icon: string, points: number, isBad: boolean }> = {
  'bean': { icon: '🫘', points: 10, isBad: false },
  'milk': { icon: '🥛', points: 15, isBad: false },
  'choco': { icon: '🍫', points: 20, isBad: false },
  'bug': { icon: '🐛', points: -1, isBad: true },
  'rock': { icon: '🪨', points: -1, isBad: true },
};

const CatchIngredients: React.FC = () => {
  const { addBeans } = useGameWallet();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [isPaused, setIsPaused] = useState(false);
  
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [basketX, setBasketX] = useState(50); // percentage 0-100
  const [items, setItems] = useState<FallingItem[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const speedMultiplierRef = useRef<number>(1);
  const isPausedRef = useRef<boolean>(false);
  
  useEffect(() => {
     isPausedRef.current = isPaused;
  }, [isPaused]);

  // Constants
  const BASKET_WIDTH_PC = 20; // 20% of container

  const spawnItem = useCallback(() => {
    const types: ItemType[] = ['bean', 'bean', 'bean', 'milk', 'milk', 'choco', 'bug', 'rock'];
    const type = types[Math.floor(Math.random() * types.length)];
    const x = Math.random() * (100 - 10); // 0 to 90%
    const speed = (20 + Math.random() * 20) * speedMultiplierRef.current; // units per second
    
    setItems(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x,
      y: -10, // Start above screen
      speed
    }]);
  }, []);

  const updateGame = useCallback(function update(time: number) {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = time;
    }
    const deltaTime = (time - lastTimeRef.current) / 1000; // seconds
    lastTimeRef.current = time;
    if (gameState === 'playing' && !isPausedRef.current) {
      // Spawn items
      spawnTimerRef.current += deltaTime;
      if (spawnTimerRef.current > 1.5 / speedMultiplierRef.current) {
        spawnItem();
        spawnTimerRef.current = 0;
        // Slowly increase difficulty
        speedMultiplierRef.current = Math.min(3, speedMultiplierRef.current + 0.02);
      }

      setItems(prevItems => {
        const nextItems: FallingItem[] = [];
        
        for (let i = 0; i < prevItems.length; i++) {
          const item = prevItems[i];
          const newY = item.y + item.speed * deltaTime;
          
          // Check collision with basket (basket is roughly at y=85 to 95)
          const basketHitboxYStart = 85;
          const basketHitboxYEnd = 95;
          
          if (newY >= basketHitboxYStart && newY <= basketHitboxYEnd) {
            // Check X collision
            const itemXCenter = item.x + 5; // assuming item is approx 10% width
            const basketLeft = basketX;
            const basketRight = basketX + BASKET_WIDTH_PC;
            
            if (itemXCenter >= basketLeft && itemXCenter <= basketRight) {
              // CAUGHT!
              const itemData = ITEMS[item.type];
              if (itemData.isBad) {
                audio.playHurt();
                setLives(l => {
                  if (l <= 1) {
                    setGameState('gameover');
                    return 0;
                  }
                  return l - 1;
                });
              } else {
                audio.playCoin();
                setScore(s => s + itemData.points);
              }
              continue; // Don't add to nextItems
            }
          }
          
          // Keep if not fallen out of screen
          if (newY < 110) {
            nextItems.push({ ...item, y: newY });
          }
        }
        
        return nextItems;
      });
    }

    requestRef.current = requestAnimationFrame(update);
  }, [gameState, basketX, spawnItem]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [updateGame]);

  useEffect(() => {
    if (gameState === 'gameover') {
      if (score > 0) {
        addBeans(Math.floor(score / 2));
      }
    }
  }, [gameState, score, addBeans]);

  const moveBasket = useCallback((direction: 'left' | 'right', amount: number) => {
    setBasketX((prev) => {
      const newX = prev + (direction === 'left' ? -amount : amount);
      return Math.max(0, Math.min(newX, 100 - BASKET_WIDTH_PC));
    });
  }, []);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setItems([]);
    setBasketX(50 - BASKET_WIDTH_PC/2);
    speedMultiplierRef.current = 1;
    spawnTimerRef.current = 0;
    setIsPaused(false);
    setGameState('playing');
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (gameState !== 'playing' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    // Center basket on cursor
    x -= BASKET_WIDTH_PC / 2;
    // Clamp
    x = Math.max(0, Math.min(x, 100 - BASKET_WIDTH_PC));
    setBasketX(x);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      if (gameState !== 'playing') return;
      if (e.code === 'ArrowLeft') {
        moveBasket('left', e.shiftKey ? 20 : 10);
      } else if (e.code === 'ArrowRight') {
        moveBasket('right', e.shiftKey ? 20 : 10);
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
         setIsPaused(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, moveBasket]);

  return (
    <div className="min-h-screen pt-24 pb-8 px-4 lg:px-8 font-sans text-primary dark:text-stone-100 bg-stone-50 dark:bg-stone-900 flex flex-col items-center select-none touch-none">
      <SEOHead 
        title="Atrapa los Ingredientes | Rose Coffee" 
        description="Atrapa los granos y evita la basura."
      />
      
      <Confetti active={gameState === 'gameover' && score > 0} />

      <div className="w-full max-w-2xl mb-6 flex justify-between items-center px-2">
        <Link 
          to="/juegos" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-full shadow-sm hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Volver</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 rounded-full font-bold shadow-sm">
            <Trophy size={18} />
            <span>Score: {score}</span>
          </div>
          <div className="flex items-center gap-1 px-4 py-2 bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 rounded-full font-bold shadow-sm">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} size={18} className={i < lives ? 'fill-current' : 'opacity-30'} />
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-md aspect-[3/4] bg-stone-200 dark:bg-stone-800 rounded-3xl shadow-2xl overflow-hidden relative border-4 border-stone-300 dark:border-stone-700 touch-none"
           ref={containerRef}
           onPointerMove={handlePointerMove}
      >
        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-black/60 backdrop-blur-sm text-white"
            >
              <div className="bg-stone-900/90 p-8 rounded-3xl text-center w-full border border-white/10 shadow-2xl">
                <h2 className="text-3xl font-black mb-4 text-amber-400">Atrapa los Ingredientes</h2>
                <p className="mb-8 text-stone-300">Desliza la cesta para atrapar granos y dulces. ¡Evita las rocas y los bichos! Tienes 3 vidas.</p>
                <button 
                  onClick={startGame}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-stone-900 rounded-full font-bold text-xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Play size={24} fill="currentColor" />
                  Jugar
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'gameover' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-black/70 backdrop-blur-sm text-white"
            >
              <div className="bg-stone-900 p-8 rounded-3xl text-center border border-white/10 shadow-2xl w-full">
                <h2 className="text-3xl font-black mb-2 text-rose-400">¡Fin del Juego!</h2>
                
                <div className="bg-black/30 rounded-2xl p-6 mb-6 mt-6">
                  <p className="text-stone-400 uppercase tracking-widest text-sm mb-1">Puntuación Final</p>
                  <p className="text-5xl font-bold text-white mb-4">{score}</p>
                  
                  <div className="h-px w-full bg-white/10 mb-4" />
                  
                  <p className="text-stone-400 uppercase tracking-widest text-sm mb-1">Granos Ganados</p>
                  <p className="text-3xl font-bold text-amber-400">+{Math.floor(score / 2)}</p>
                </div>

                <button 
                  onClick={startGame}
                  className="w-full py-4 bg-white text-stone-900 hover:bg-stone-200 rounded-full font-bold text-xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={24} />
                  Jugar de Nuevo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Area */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-gradient-to-b from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900">
          
          {/* Falling Items */}
          {items.map(item => (
            <div 
              key={item.id}
              className="absolute text-4xl"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
              }}
            >
              {ITEMS[item.type].icon}
            </div>
          ))}

          <AnimatePresence>
            {isPaused && gameState === 'playing' && (
               <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20"
              >
                 <h2 className="text-4xl font-black text-amber-400 mb-4 uppercase tracking-widest drop-shadow-lg">Pausado</h2>
                 <button 
                    onClick={() => setIsPaused(false)}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-full border border-white/20 shadow-lg transition-all"
                 >
                    REANUDAR
                 </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Basket */}
          <div 
            className="absolute bottom-[5%] h-16 bg-amber-700 dark:bg-amber-800 rounded-b-2xl rounded-t-sm shadow-xl flex items-center justify-center border-t-8 border-amber-600 dark:border-amber-700 transition-all duration-75"
            style={{
              left: `${basketX}%`,
              width: `${BASKET_WIDTH_PC}%`
            }}
          >
            <div className="text-white/50 text-xs font-bold uppercase tracking-widest">Rose</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatchIngredients;
