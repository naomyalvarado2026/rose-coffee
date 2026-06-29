import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Pause, Home, Crosshair, Wrench, Zap, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '../../../components/common/SEOHead';
import { useGameWallet } from '../../../contexts/GameWalletContext';
import type { GameState, Upgrades } from '../../../components/games/CoffeeInvaders/Engine';
import { CoffeeInvadersEngine } from '../../../components/games/CoffeeInvaders/Engine';
import { MobileGameController } from '../../../components/games/common/MobileGameController';

export default function CoffeeInvaders() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<CoffeeInvadersEngine | null>(null);
  const { beans, addBeans, spendBeans } = useGameWallet();

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    combo: 1,
    lives: 3,
    isGameOver: false,
    isPlaying: false,
    isPaused: false
  });

  const [upgrades, setUpgrades] = useState<Upgrades>({
    fireRate: parseInt(localStorage.getItem('ci_fireRate') || '0'),
    moveSpeed: parseInt(localStorage.getItem('ci_moveSpeed') || '0'),
    extraLives: parseInt(localStorage.getItem('ci_extraLives') || '0'),
  });

  const [showStore, setShowStore] = useState(false);

  const handleScore = useCallback((score: number) => {
    addBeans(score);
  }, [addBeans]);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (container && canvas) {
        const maxWidth = Math.min(container.clientWidth, 600);
        const maxHeight = window.innerHeight * 0.6;
        
        canvas.width = maxWidth;
        canvas.height = maxHeight;
        
        if (engineRef.current) {
          engineRef.current.handleResize(maxWidth, maxHeight);
        }
      }
    };
    
    const canvas = canvasRef.current;
    canvas.width = 600;
    canvas.height = 800;

    engineRef.current = new CoffeeInvadersEngine(
      canvas,
      setGameState,
      handleScore,
      upgrades
    );
    
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      if (engineRef.current) {
        engineRef.current.cleanup();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [handleScore, upgrades]);


  const startGame = () => {
    if (engineRef.current) {
      engineRef.current.start();
    }
  };
  
  const togglePause = () => {
    if (engineRef.current) {
      engineRef.current.togglePause();
    }
  };

  const handleDir = (dir: number) => {
    if (engineRef.current) {
      engineRef.current.setMoveDir(dir);
    }
  };
  
  const handleShoot = (shooting: boolean) => {
    if (engineRef.current) {
      engineRef.current.setShooting(shooting);
    }
  };

  const buyUpgrade = (type: keyof Upgrades, max: number) => {
    const current = upgrades[type];
    if (current >= max) return;
    
    const cost = 1000 + (current * 1500);
    if (beans >= cost) {
      if (spendBeans(cost)) {
        const newUpgrades = { ...upgrades, [type]: current + 1 };
        setUpgrades(newUpgrades);
        localStorage.setItem(`ci_${type}`, newUpgrades[type].toString());
      }
    }
  };

  const getCost = (current: number) => 1000 + (current * 1500);

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col font-sans">
      <SEOHead 
        title="Coffee Invaders | Rose Coffee"
        description="Defiende tu cafetería de las tazas alienígenas en este frenético arcade retro."
      />

      <header className="flex-none p-4 md:p-6 pb-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link 
            to="/juegos"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">Volver</span>
          </Link>

          <div className="flex gap-4">
             <div className="bg-[#1E293B] px-4 py-2 rounded-xl flex items-center gap-2 border border-white/5">
              <span className="text-[#d4af37] text-sm">Granos:</span>
              <span className="text-[#d4af37] font-bold">{beans.toLocaleString()}</span>
            </div>
            <div className="bg-[#1E293B] px-4 py-2 rounded-xl flex items-center gap-2 border border-white/5">
              <span className="text-[#ef4444] font-bold">Vidas: {gameState.lives}</span>
            </div>
            <div className="bg-[#1E293B] px-4 py-2 rounded-xl flex flex-col sm:flex-row items-center gap-2 border border-white/5">
              <span className="text-gray-400 text-sm">Puntos</span>
              <span className="text-[#D4AF37] font-bold">{gameState.score}</span>
              {gameState.combo > 1 && (
                <span className="text-[#f59e0b] text-xs font-black italic ml-2">x{gameState.combo}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden touch-none select-none" ref={containerRef}>
        <div className="relative w-full max-w-[600px] rounded-xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)] border-2 border-white/10 bg-[#000000] touch-none select-none">
          <canvas
            ref={canvasRef}
            className="block w-full h-auto"
            style={{ imageRendering: 'pixelated' }}
          />

          <AnimatePresence>
            {!gameState.isPlaying && !gameState.isGameOver && !showStore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm"
              >
                <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 mb-2 italic uppercase">
                  Coffee Invaders
                </h1>
                <p className="text-gray-300 mb-8 max-w-sm text-sm">
                  Controla la máquina de espresso. Destruye oleadas de tazas vacías alienígenas.
                </p>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={startGame}
                    className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black py-4 px-12 rounded-full transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-lg shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    INICIAR DEFENSA
                  </button>
                  <button
                    onClick={() => setShowStore(true)}
                    className="bg-gray-800 hover:bg-gray-700 text-[#d4af37] font-bold py-3 px-8 rounded-full border border-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Wrench className="w-5 h-5" />
                    Mejorar Nave
                  </button>
                </div>
              </motion.div>
            )}

            {showStore && !gameState.isPlaying && !gameState.isGameOver && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-0 bg-gray-900/95 flex flex-col items-center justify-center p-6 backdrop-blur-md overflow-y-auto"
              >
                <h2 className="text-2xl font-black text-[#d4af37] mb-6 flex items-center gap-2">
                  <Wrench /> Hangar de Mejoras
                </h2>
                
                <div className="w-full max-w-sm space-y-4 mb-8">
                  {/* Fire Rate Upgrade */}
                  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2 text-white font-bold">
                        <Zap className="w-4 h-4 text-yellow-400" /> Cadencia de Fuego
                      </div>
                      <div className="text-xs text-gray-400">Nvl {upgrades.fireRate}/5</div>
                    </div>
                    <button 
                      disabled={upgrades.fireRate >= 5 || beans < getCost(upgrades.fireRate)}
                      onClick={() => buyUpgrade('fireRate', 5)}
                      className="w-full py-2 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-500 rounded font-bold disabled:opacity-50 transition-colors"
                    >
                      {upgrades.fireRate >= 5 ? 'MAX' : `Mejorar (${getCost(upgrades.fireRate)} Granos)`}
                    </button>
                  </div>

                  {/* Move Speed Upgrade */}
                  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2 text-white font-bold">
                        <motion.div animate={{x: [-2, 2, -2]}} transition={{repeat: Infinity, duration: 2}}><Play className="w-4 h-4 text-blue-400" /></motion.div>
                        Velocidad de Movimiento
                      </div>
                      <div className="text-xs text-gray-400">Nvl {upgrades.moveSpeed}/5</div>
                    </div>
                    <button 
                      disabled={upgrades.moveSpeed >= 5 || beans < getCost(upgrades.moveSpeed)}
                      onClick={() => buyUpgrade('moveSpeed', 5)}
                      className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded font-bold disabled:opacity-50 transition-colors"
                    >
                      {upgrades.moveSpeed >= 5 ? 'MAX' : `Mejorar (${getCost(upgrades.moveSpeed)} Granos)`}
                    </button>
                  </div>

                  {/* Extra Lives Upgrade */}
                  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2 text-white font-bold">
                        <Heart className="w-4 h-4 text-red-500" /> Vidas Extra Iniciales
                      </div>
                      <div className="text-xs text-gray-400">Nvl {upgrades.extraLives}/3</div>
                    </div>
                    <button 
                      disabled={upgrades.extraLives >= 3 || beans < getCost(upgrades.extraLives)}
                      onClick={() => buyUpgrade('extraLives', 3)}
                      className="w-full py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded font-bold disabled:opacity-50 transition-colors"
                    >
                      {upgrades.extraLives >= 3 ? 'MAX' : `Mejorar (${getCost(upgrades.extraLives)} Granos)`}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowStore(false)}
                  className="text-gray-400 hover:text-white font-bold underline"
                >
                  Volver al Menú
                </button>
              </motion.div>
            )}

            {gameState.isPaused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm"
              >
                <div className="text-3xl font-bold text-white mb-6">PAUSA</div>
                <button
                  onClick={togglePause}
                  className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-8 rounded-full transition-colors backdrop-blur-md"
                >
                  Continuar
                </button>
              </motion.div>
            )}

            {gameState.isGameOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm"
              >
                <h2 className="text-4xl font-black text-red-500 mb-2 uppercase">Invasión Exitosa</h2>
                <p className="text-gray-400 mb-6">Te quedaste sin vidas o los enemigos llegaron a la barra.</p>
                
                <div className="bg-black/50 p-6 rounded-2xl border border-white/10 mb-8 w-full max-w-xs">
                  <div className="text-sm text-gray-400 mb-1">Puntuación Final</div>
                  <div className="text-[#D4AF37] text-5xl font-black">{gameState.score}</div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <button
                    onClick={startGame}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-12 rounded-full transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-lg"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Intentar de Nuevo
                  </button>
                  <button
                    onClick={() => { setGameState({...gameState, isGameOver: false}); setShowStore(true); }}
                    className="bg-gray-800 hover:bg-gray-700 text-[#d4af37] font-bold py-3 px-8 rounded-full border border-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Wrench className="w-5 h-5" />
                    Mejorar Nave
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {gameState.isPlaying && !gameState.isGameOver && (
            <MobileGameController
              className="absolute bottom-4 left-0 w-full flex justify-between px-6 sm:hidden z-50 pointer-events-none [&_button]:pointer-events-auto"
              dPadConfig={{ up: false, down: false, left: true, right: true }}
              onDirX={handleDir}
              actionA={{
                icon: <Crosshair className="w-8 h-8 text-white" />,
                onPress: handleShoot,
                colorClass: 'bg-red-500/80 active:bg-red-500 border-red-400'
              }}
            />
          )}
        </div>
      </main>
      
      {gameState.isPlaying && !gameState.isGameOver && (
        <div className="absolute top-4 right-4 z-50">
           <button 
              onClick={togglePause}
              className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors border border-white/20"
            >
              {gameState.isPaused ? <Play className="w-5 h-5 text-white" /> : <Pause className="w-5 h-5 text-white" />}
            </button>
        </div>
      )}
    </div>
  );
}
