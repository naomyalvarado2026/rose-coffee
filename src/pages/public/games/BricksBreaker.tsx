import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RefreshCw, Trophy, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGameWallet } from '../../../contexts/GameWalletContext';
import { BricksEngine } from '../../../components/games/BricksBreaker/Engine';
import SEOHead from '../../../components/common/SEOHead';

const BricksBreaker: React.FC = () => {
  const { addBeans } = useGameWallet();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BricksEngine | null>(null);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover' | 'won'>('idle');
  const [isPaused, setIsPaused] = useState(false);

  const handleGameOver = useCallback((finalScore: number, win: boolean) => {
    setGameState(win ? 'won' : 'gameover');
    
    // Reward calculation
    if (finalScore > 0) {
      addBeans(Math.floor(finalScore / 2));
    }
  }, [addBeans]);

  const initGame = useCallback(() => {
    if (!canvasRef.current) return;
    
    if (!engineRef.current) {
      engineRef.current = new BricksEngine(
        canvasRef.current,
        (newScore) => setScore(newScore),
        (finalScore, win) => handleGameOver(finalScore, win),
        (newLives) => setLives(newLives),
        (newLevel) => setLevel(newLevel)
      );
    }
  }, [handleGameOver]);

  useEffect(() => {
    initGame();
    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, [initGame]);

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setLevel(1);
    setIsPaused(false);
    if (engineRef.current) {
      engineRef.current.start();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyP' || e.code === 'Escape') {
         e.preventDefault();
         if (gameState === 'playing' && engineRef.current) {
            const paused = engineRef.current.togglePause();
            setIsPaused(paused);
         }
      } else if (engineRef.current) {
         engineRef.current.handleKeyDown(e);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
       if (engineRef.current) {
          engineRef.current.handleKeyUp(e);
       }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
       window.removeEventListener('keydown', handleKeyDown);
       window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);
  
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
     if (engineRef.current && gameState === 'playing' && !isPaused) {
        engineRef.current.handlePointerMove(e.clientX);
     }
  };

  return (
    <>
      <SEOHead 
        title="Coffee Breaker | Rose Coffee"
        description="Destruye los terrones de azúcar y recolecta granos en este adictivo juego de Rose Coffee."
      />

      <div className="min-h-screen bg-stone-950 pt-24 pb-12 flex flex-col items-center select-none overflow-hidden touch-none relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
           backgroundImage: 'radial-gradient(#78350f 1px, transparent 1px)',
           backgroundSize: '20px 20px'
        }}></div>
        
        {/* Header */}
        <div className="w-full max-w-4xl px-4 flex justify-between items-center mb-6 z-10">
          <Link 
            to="/games"
            className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors bg-stone-900/50 px-4 py-2 rounded-full backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Volver</span>
          </Link>
          
          <div className="flex gap-4">
             <div className="bg-stone-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-stone-800 flex items-center gap-2 text-amber-500">
               <span className="text-sm font-medium">NIVEL</span>
               <span className="font-bold">{level}</span>
             </div>
             <div className="bg-stone-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-stone-800 flex items-center gap-2">
               {Array.from({ length: 3 }).map((_, i) => (
                 <Coffee key={i} className={`w-4 h-4 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-stone-700'}`} />
               ))}
             </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="relative w-full max-w-4xl px-4 aspect-[4/3] md:aspect-video max-h-[70vh] z-10 flex justify-center">
          
          {gameState === 'idle' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-4 z-20 flex flex-col items-center justify-center bg-stone-900/80 backdrop-blur-md rounded-2xl border-2 border-stone-800 p-8 text-center"
            >
               <h1 className="text-4xl md:text-6xl font-black text-white mb-2 uppercase tracking-tighter">Coffee <span className="text-amber-500">Breaker</span></h1>
               <p className="text-stone-400 max-w-md mb-8">Destruye los bloques con tu portafiltro. ¡Recoge poderes y recolecta granos de café!</p>
               
               <div className="flex gap-4 text-sm text-stone-500 mb-8">
                  <div className="flex flex-col items-center"><span className="text-2xl mb-1">↔</span> Controles: Mouse / Táctil / Flechas</div>
                  <div className="flex flex-col items-center"><span className="text-2xl mb-1 text-yellow-400">●●</span> Multibola</div>
                  <div className="flex flex-col items-center"><span className="text-2xl mb-1 text-green-400">↔</span> Expandir</div>
               </div>

              <button
                onClick={startGame}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-amber-600 font-pj rounded-xl hover:bg-amber-500"
              >
                <Play className="w-6 h-6 mr-2 fill-current" />
                Jugar Ahora
              </button>
            </motion.div>
          )}

          <AnimatePresence>
            {isPaused && gameState === 'playing' && (
               <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-4 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20 rounded-2xl"
              >
                 <h2 className="text-4xl font-black text-amber-400 mb-4 uppercase tracking-widest drop-shadow-lg">Pausado</h2>
                 <button 
                    onClick={() => {
                       if (engineRef.current) {
                          const paused = engineRef.current.togglePause();
                          setIsPaused(paused);
                       }
                    }}
                    className="bg-amber-800 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-full border border-white/20 shadow-lg transition-all"
                 >
                    REANUDAR
                 </button>
              </motion.div>
            )}
          </AnimatePresence>

          {(gameState === 'gameover' || gameState === 'won') && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-4 z-20 flex flex-col items-center justify-center bg-stone-900/90 backdrop-blur-md rounded-2xl border-2 border-stone-800"
            >
              <Trophy className={`w-20 h-20 mb-4 ${gameState === 'won' ? 'text-yellow-400' : 'text-stone-600'}`} />
              <h2 className="text-4xl font-black text-white mb-2 uppercase">
                 {gameState === 'won' ? '¡Nivel Máximo!' : 'Game Over'}
              </h2>
              <div className="text-center mb-8">
                <p className="text-stone-400 mb-1">Puntuación Final</p>
                <p className="text-5xl font-black text-amber-500">{score}</p>
                <p className="text-amber-400/80 mt-2 font-medium">+{Math.floor(score / 2)} Granos</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-bold transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Jugar de Nuevo
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <div className="absolute top-4 right-8 flex flex-col gap-2 z-10 pointer-events-auto">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-lg">
                <span className="font-black text-2xl text-white">{score}</span>
              </div>
              <button
                 onClick={(e) => {
                    e.stopPropagation();
                    if (engineRef.current) {
                       const paused = engineRef.current.togglePause();
                       setIsPaused(paused);
                    }
                 }}
                 className="bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-lg text-xs font-bold text-white transition-colors"
              >
                 {isPaused ? 'REANUDAR' : 'PAUSAR'}
              </button>
            </div>
          )}

          <canvas 
            ref={canvasRef}
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerMove}
            className="w-full h-full bg-stone-900 rounded-2xl shadow-2xl border border-stone-800 touch-none cursor-crosshair"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </div>
    </>
  );
};

export default BricksBreaker;
