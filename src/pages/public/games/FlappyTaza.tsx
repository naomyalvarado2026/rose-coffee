import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RefreshCw, Trophy, Coffee, Lock, ShoppingCart, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGameWallet } from '../../../contexts/GameWalletContext';
import { FlappyEngine, TAZA_SKINS } from '../../../components/games/FlappyTaza/Engine';
import SEOHead from '../../../components/common/SEOHead';
import { audio } from '../../../utils/audioEngine';

const FlappyTaza: React.FC = () => {
  const { beans, totalBeans, setBeansDirectly, addBeans } = useGameWallet();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FlappyEngine | null>(null);

  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const best = localStorage.getItem('flappy_taza_best');
    return best ? parseInt(best, 10) : 0;
  });
  
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [isPaused, setIsPaused] = useState(false);

  // Skins State
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(() => {
    const saved = localStorage.getItem('flappy_taza_unlocked');
    return saved ? JSON.parse(saved) : ['classic'];
  });
  const [selectedSkinId, setSelectedSkinId] = useState<string>(() => {
    return localStorage.getItem('flappy_taza_selected') || 'classic';
  });

  const selectedSkin = TAZA_SKINS.find(s => s.id === selectedSkinId) || TAZA_SKINS[0];

  const handleGameOver = useCallback((finalScore: number) => {
    setGameState('gameover');
    
    if (finalScore > bestScore) {
      setBestScore(finalScore);
      localStorage.setItem('flappy_taza_best', finalScore.toString());
    }

    // Reward calculation based on current multiplier
    if (finalScore > 0) {
      addBeans(finalScore * 5); // engine already multiplied the score
    }
  }, [bestScore, addBeans]);

  const initGame = useCallback(() => {
    if (!canvasRef.current) return;
    
    if (!engineRef.current) {
      engineRef.current = new FlappyEngine(
        canvasRef.current,
        (newScore) => setScore(newScore),
        (finalScore) => handleGameOver(finalScore),
        selectedSkin
      );
    } else {
      engineRef.current.setConfig(selectedSkin);
    }
  }, [handleGameOver, selectedSkin]);

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
    if (engineRef.current) {
      engineRef.current.setConfig(selectedSkin);
      engineRef.current.start();
      setIsPaused(false);
    }
  }, [selectedSkin]);

  const handleJump = useCallback(() => {
    if (gameState === 'playing' && engineRef.current) {
      engineRef.current.jump();
    } else if (gameState === 'idle' || gameState === 'gameover') {
      startGame();
    }
  }, [gameState, startGame]);

  const handleFastFall = useCallback(() => {
    if (gameState === 'playing' && engineRef.current) {
      engineRef.current.fastFall();
    }
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        handleFastFall();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
         e.preventDefault();
         if (gameState === 'playing' && engineRef.current) {
            const paused = engineRef.current.togglePause();
            setIsPaused(paused);
         }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump, handleFastFall, gameState]);

  const buySkin = (e: React.MouseEvent, skin: typeof TAZA_SKINS[0]) => {
    e.stopPropagation();
    if (beans >= skin.price && !unlockedSkins.includes(skin.id)) {
       setBeansDirectly(beans - skin.price, totalBeans);
       const newUnlocked = [...unlockedSkins, skin.id];
       setUnlockedSkins(newUnlocked);
       localStorage.setItem('flappy_taza_unlocked', JSON.stringify(newUnlocked));
       setSelectedSkinId(skin.id);
       localStorage.setItem('flappy_taza_selected', skin.id);
       audio.playCoin();
    } else {
       audio.playHurt(); // not enough beans
    }
  };

  const selectSkin = (e: React.MouseEvent, skinId: string) => {
    e.stopPropagation();
    if (unlockedSkins.includes(skinId)) {
        setSelectedSkinId(skinId);
        localStorage.setItem('flappy_taza_selected', skinId);
        audio.playCoin();
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-8 px-4 lg:px-8 font-sans text-primary dark:text-stone-100 bg-stone-50 dark:bg-stone-900 flex flex-col items-center">
      <SEOHead 
        title="Flappy Taza | Rose Coffee" 
        description="Manten la taza a flote esquivando los molinillos. ¡Un clásico arcade muy adictivo!"
      />

      <div className="w-full max-w-lg mb-4 flex justify-between items-center">
        <Link 
          to="/juegos" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-full shadow-sm hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Volver</span>
        </Link>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200 rounded-full font-medium shadow-sm">
            <Trophy size={18} />
            <span>Mécord: {bestScore}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-stone-200 dark:bg-stone-800 text-coffee dark:text-gold rounded-full font-medium shadow-sm">
            <Coffee size={18} />
            <span>{Math.floor(beans).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-serif font-bold text-rose-900 dark:text-rose-300 mb-2">
          Flappy Taza
        </h1>
        <p className="text-stone-600 dark:text-stone-400">
          Haz clic o presiona <b>Espacio</b> para volar. Esquiva los obstáculos.
        </p>
      </div>

      <div 
        className="relative w-full max-w-[400px] h-[500px] bg-sky-200 dark:bg-sky-900/40 rounded-xl overflow-hidden shadow-2xl cursor-pointer ring-4 ring-white dark:ring-stone-800"
        onPointerDown={handleJump}
      >
        <canvas 
          ref={canvasRef}
          className="w-full h-full block"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Live Score */}
        {gameState === 'playing' && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 pointer-events-auto">
            <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-stone-200 dark:border-stone-700 shadow-lg">
              <span className="font-black text-2xl text-amber-900 dark:text-amber-100">{score}</span>
            </div>
            <button
               onClick={(e) => {
                  e.stopPropagation();
                  if (engineRef.current) {
                     const paused = engineRef.current.togglePause();
                     setIsPaused(paused);
                  }
               }}
               className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-stone-200 dark:border-stone-700 shadow-lg text-xs font-bold text-stone-700 dark:text-stone-300 pointer-events-auto"
            >
               {isPaused ? 'REANUDAR' : 'PAUSAR'}
            </button>
          </div>
        )}

        {/* Overlays */}
        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 flex flex-col items-center justify-between text-white p-6 overflow-y-auto custom-scrollbar"
            >
              <div className="text-center w-full mt-4">
                <Coffee size={48} className="mx-auto mb-2 text-white drop-shadow-lg" />
                <h2 className="text-2xl font-bold mb-4 drop-shadow-md">¿Listo para volar?</h2>
              </div>

              {/* Character Shop */}
              <div className="w-full space-y-2 mb-4" onPointerDown={e => e.stopPropagation()}>
                {TAZA_SKINS.map(skin => {
                  const isUnlocked = unlockedSkins.includes(skin.id);
                  const isSelected = selectedSkinId === skin.id;
                  const canAfford = beans >= skin.price;

                  return (
                    <div 
                      key={skin.id}
                      onClick={(e) => {
                        if (isUnlocked) selectSkin(e, skin.id);
                        else if (canAfford) buySkin(e, skin);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer
                        ${isSelected ? 'bg-white/20 border-white' : 'bg-black/40 border-white/10 hover:border-white/30'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/20"
                          style={{ backgroundColor: skin.baseColor }}
                        >
                          <Coffee size={20} style={{ color: skin.accentColor }} />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-sm">{skin.name}</div>
                          <div className="text-[10px] text-stone-300">{skin.desc}</div>
                        </div>
                      </div>

                      <div>
                        {isSelected ? (
                          <div className="flex items-center gap-1 text-green-400 font-bold text-sm bg-green-900/30 px-3 py-1 rounded-full">
                            <Check size={14} /> Seleccionado
                          </div>
                        ) : isUnlocked ? (
                          <button className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors">
                            Equipar
                          </button>
                        ) : (
                          <button 
                            className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full transition-colors
                              ${canAfford ? 'bg-amber-500 hover:bg-amber-400 text-stone-900' : 'bg-white/10 text-stone-400'}`}
                          >
                            {canAfford ? <ShoppingCart size={14} /> : <Lock size={14} />}
                            {skin.price.toLocaleString()}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="flex items-center gap-2 px-8 py-3 bg-rose-600 hover:bg-rose-500 rounded-full font-bold text-lg shadow-xl transition-transform hover:scale-105 active:scale-95 shrink-0"
              >
                <Play size={24} fill="currentColor" />
                <span>Jugar Ahora</span>
              </button>
            </motion.div>
          )}

          {isPaused && gameState === 'playing' && (
             <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20"
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

          {gameState === 'gameover' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-6"
            >
              <h2 className="text-4xl font-black mb-2 text-rose-400 drop-shadow-lg">¡Auch!</h2>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 w-full max-w-[280px] border border-white/20">
                <div className="text-center mb-4">
                  <p className="text-stone-300 text-sm uppercase tracking-wider mb-1">Puntuación</p>
                  <p className="text-5xl font-bold text-white">{score}</p>
                </div>
                
                <div className="h-px w-full bg-white/20 mb-4" />
                
                <div className="text-center mb-4">
                  <p className="text-stone-300 text-sm uppercase tracking-wider mb-1">Mejor Récord</p>
                  <p className="text-3xl font-bold text-amber-400">{bestScore}</p>
                </div>

                <div className="h-px w-full bg-white/20 mb-4" />

                <div className="text-center">
                  <p className="text-stone-300 text-sm uppercase tracking-wider mb-1">Recompensa</p>
                  <p className="text-2xl font-bold text-green-400">+{score * 5} Granos</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); setGameState('idle'); }}
                  className="flex items-center gap-2 px-4 py-3 bg-stone-700 hover:bg-stone-600 rounded-full font-bold text-lg shadow-xl transition-transform hover:scale-105 active:scale-95"
                >
                  <ShoppingCart size={24} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); startGame(); }}
                  className="flex flex-1 items-center justify-center gap-2 px-8 py-3 bg-white text-rose-600 hover:bg-stone-100 rounded-full font-bold text-lg shadow-xl transition-transform hover:scale-105 active:scale-95"
                >
                  <RefreshCw size={24} />
                  <span>Reintentar</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FlappyTaza;
