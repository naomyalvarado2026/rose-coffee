import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RefreshCw, Trophy, Coffee, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGameWallet } from '../../../contexts/GameWalletContext';
import SEOHead from '../../../components/common/SEOHead';
import Confetti from '../../../components/games/common/Confetti';
import { audio } from '../../../utils/audioEngine';

// Ingredients
const INGREDIENTS = [
  { id: 'espresso', name: 'Espresso', icon: '☕', color: 'bg-[#4a2c11] text-white' },
  { id: 'milk', name: 'Leche', icon: '🥛', color: 'bg-white text-stone-800' },
  { id: 'foam', name: 'Espuma', icon: '☁️', color: 'bg-stone-100 text-stone-800' },
  { id: 'ice', name: 'Hielo', icon: '🧊', color: 'bg-sky-200 text-sky-900' },
  { id: 'caramel', name: 'Caramelo', icon: '🍯', color: 'bg-amber-500 text-white' },
  { id: 'cacao', name: 'Cacao', icon: '🍫', color: 'bg-[#78350f] text-white' },
  { id: 'water', name: 'Agua', icon: '💧', color: 'bg-blue-300 text-blue-900' },
];

const RECIPES = [
  { name: 'Espresso', ingredients: ['espresso'] },
  { name: 'Americano', ingredients: ['espresso', 'water'] },
  { name: 'Latte', ingredients: ['espresso', 'milk', 'foam'] },
  { name: 'Capuchino', ingredients: ['espresso', 'milk', 'foam', 'cacao'] },
  { name: 'Frappé', ingredients: ['espresso', 'milk', 'ice', 'caramel'] },
  { name: 'Iced Coffee', ingredients: ['espresso', 'water', 'ice'] },
  { name: 'Mocha', ingredients: ['espresso', 'milk', 'cacao'] }
];

const GAME_DURATION = 45; // seconds

const FastBarista: React.FC = () => {
  const { addBeans } = useGameWallet();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  
  const [currentOrder, setCurrentOrder] = useState<typeof RECIPES[0] | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [shake, setShake] = useState(false);

  const getNewOrder = useCallback(() => {
    const randomRecipe = RECIPES[Math.floor(Math.random() * RECIPES.length)];
    setCurrentOrder(randomRecipe);
    setSelectedIngredients([]);
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(GAME_DURATION);
    getNewOrder();
    audio.playPowerUp();
  };

  useEffect(() => {
    let timer: number;
    if (gameState === 'playing' && !isPaused && timeLeft > 0) {
      timer = window.setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (gameState === 'playing' && !isPaused && timeLeft === 0) {
      window.setTimeout(() => {
        setGameState('gameover');
        if (score > 0) {
          addBeans(score); // 1 score = 1 bean
          audio.playPowerUp();
        } else {
          audio.playHurt();
        }
      }, 0);
    }
    return () => clearTimeout(timer);
  }, [gameState, isPaused, timeLeft, score, addBeans]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.code === 'KeyP' || e.code === 'Escape') {
         setIsPaused(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const addIngredient = (ingredientId: string) => {
    if (gameState !== 'playing' || !currentOrder) return;
    
    audio.playJump();
    const newSelected = [...selectedIngredients, ingredientId];
    setSelectedIngredients(newSelected);

    // Check if recipe is fulfilled (order agnostic)
    const required = [...currentOrder.ingredients].sort();
    const current = [...newSelected].sort();
    
    // Check if the current selection is valid so far
    let isValid = true;
    const reqCounts: Record<string, number> = {};
    required.forEach(i => reqCounts[i] = (reqCounts[i] || 0) + 1);
    
    const curCounts: Record<string, number> = {};
    current.forEach(i => curCounts[i] = (curCounts[i] || 0) + 1);

    for (const key in curCounts) {
      if (!reqCounts[key] || curCounts[key] > reqCounts[key]) {
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      // Mistake!
      setShake(true);
      audio.playHurt();
      setTimeout(() => setShake(false), 400);
      setSelectedIngredients([]); // Reset current cup
      return;
    }

    // Check if fully complete
    if (required.length === current.length && required.every((val, index) => val === current[index])) {
      audio.playCoin();
      setScore(prev => prev + 10);
      
      // Bonus time every 5 drinks
      if (score > 0 && (score + 10) % 50 === 0) {
        setTimeLeft(prev => prev + 5);
      }

      setTimeout(() => {
        getNewOrder();
      }, 300);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-8 px-4 lg:px-8 font-sans text-primary dark:text-stone-100 bg-stone-50 dark:bg-stone-900 flex flex-col items-center">
      <SEOHead 
        title="Barista Veloz | Rose Coffee" 
        description="Prepara los pedidos de café tan rápido como puedas."
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
           {gameState === 'playing' && (
              <button
                 onClick={() => setIsPaused(!isPaused)}
                 className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-full border border-stone-700 text-xs font-bold transition-colors"
              >
                 {isPaused ? 'REANUDAR' : 'PAUSAR'}
              </button>
           )}
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 rounded-full font-bold shadow-sm">
            <Trophy size={18} />
            <span>Score: {score}</span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-sm transition-colors ${timeLeft <= 10 ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 animate-pulse' : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'}`}>
            <Clock size={18} />
            <span>00:{timeLeft.toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl text-center mb-8">
        <h1 className="text-4xl font-serif font-bold text-rose-900 dark:text-rose-300 tracking-tight mb-2">
          Barista Veloz
        </h1>
        <p className="text-stone-600 dark:text-stone-400">
          Prepara los pedidos combinando los ingredientes correctos antes de que se acabe el tiempo.
        </p>
      </div>

      <div className="w-full max-w-2xl flex-1 flex flex-col bg-white dark:bg-stone-800 rounded-3xl shadow-xl overflow-hidden relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {gameState === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-sm text-white"
            >
              <div className="bg-stone-900/90 p-8 rounded-3xl text-center max-w-md border border-white/10 shadow-2xl">
                <Coffee size={64} className="mx-auto mb-6 text-amber-400" />
                <h2 className="text-3xl font-black mb-4">¿Listo para el turno?</h2>
                <p className="mb-8 text-stone-300 text-lg">Tienes {GAME_DURATION} segundos para preparar tantos pedidos como puedas. Cada pedido correcto te dará 10 Granos.</p>
                <button 
                  onClick={startGame}
                  className="w-full py-4 bg-rose-600 hover:bg-rose-500 rounded-full font-bold text-xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Play size={24} fill="currentColor" />
                  Empezar a Trabajar
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'gameover' && (
            <motion.div 
              key="gameover"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 bg-black/60 backdrop-blur-sm text-white"
            >
               <div className="bg-stone-900 p-8 rounded-3xl text-center max-w-sm border border-white/10 shadow-2xl w-full">
                <h2 className="text-3xl font-black mb-2 text-rose-400">¡Turno Terminado!</h2>
                
                <div className="bg-black/30 rounded-2xl p-6 mb-6 mt-6">
                  <p className="text-stone-400 uppercase tracking-widest text-sm mb-1">Pedidos Completados</p>
                  <p className="text-5xl font-bold text-white mb-4">{score / 10}</p>
                  
                  <div className="h-px w-full bg-white/10 mb-4" />
                  
                  <p className="text-stone-400 uppercase tracking-widest text-sm mb-1">Ganancia Total</p>
                  <p className="text-3xl font-bold text-green-400">+{score} Granos</p>
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

        <AnimatePresence>
          {isPaused && gameState === 'playing' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20 rounded-3xl"
            >
              <h2 className="text-4xl font-black text-amber-400 mb-4 uppercase tracking-widest drop-shadow-lg">Pausado</h2>
              <button 
                onClick={() => setIsPaused(false)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-8 rounded-full border border-white/20 shadow-lg transition-all"
              >
                REANUDAR
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Area */}
        <div className="flex-1 flex flex-col p-6 lg:p-8">
          
          {/* Order Ticket */}
          <div className="h-40 bg-stone-100 dark:bg-stone-900 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 flex flex-col items-center justify-center p-4 mb-8">
            {currentOrder ? (
              <motion.div 
                key={currentOrder.name}
                initial={{ opacity: 0, y: 20 }}
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : { opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="text-sm uppercase tracking-widest text-stone-500 font-bold mb-2">Pedido Actual</div>
                <h2 className="text-3xl sm:text-4xl font-black text-rose-900 dark:text-rose-300 mb-4">{currentOrder.name}</h2>
                <div className="flex flex-wrap justify-center gap-2">
                  {currentOrder.ingredients.map((ingId, idx) => {
                    const ing = INGREDIENTS.find(i => i.id === ingId);
                    const isAdded = selectedIngredients.filter(i => i === ingId).length > currentOrder.ingredients.slice(0, idx).filter(i => i === ingId).length;
                    
                    return (
                      <div 
                        key={idx} 
                        className={`px-3 py-1.5 rounded-full font-bold text-sm flex items-center gap-1 transition-all ${
                          isAdded 
                            ? 'bg-green-500 text-white scale-110 shadow-lg' 
                            : 'bg-white dark:bg-stone-800 text-stone-400 border border-stone-200 dark:border-stone-700'
                        }`}
                      >
                        <span>{ing?.icon}</span>
                        <span className={isAdded ? '' : 'line-through opacity-50'}>{ing?.name}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <div className="text-stone-400">Esperando pedido...</div>
            )}
          </div>

          {/* Ingredient Buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-auto">
            {INGREDIENTS.map(ing => (
              <button
                key={ing.id}
                onClick={() => addIngredient(ing.id)}
                disabled={gameState !== 'playing'}
                className={`aspect-square flex flex-col items-center justify-center p-2 rounded-2xl shadow-sm hover:shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${ing.color}`}
              >
                <span className="text-3xl sm:text-4xl mb-2 drop-shadow-sm">{ing.icon}</span>
                <span className="font-bold text-xs sm:text-sm tracking-wide">{ing.name}</span>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default FastBarista;
