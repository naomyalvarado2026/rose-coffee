import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Pause, Home, ChevronLeft, ChevronRight, ChevronDown, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '../../../components/common/SEOHead';
import { useGameWallet } from '../../../contexts/GameWalletContext';
import type { GameState } from '../../../components/games/LatteArtPuzzle/Engine';
import { LatteArtEngine } from '../../../components/games/LatteArtPuzzle/Engine';

export default function LatteArtPuzzle() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<LatteArtEngine | null>(null);
  const { addBeans } = useGameWallet();

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    lines: 0,
    isGameOver: false,
    isPlaying: false,
    isPaused: false
  });
  
  const [comboScore, setComboScore] = useState<number>(0);
  const [showCombo, setShowCombo] = useState<boolean>(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Scale canvas properly for mobile
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (container && canvas) {
        // Tetris board is typically 10:20 (1:2 ratio)
        const maxWidth = container.clientWidth;
        const maxHeight = window.innerHeight * 0.6;
        
        const w = Math.min(maxWidth, maxHeight / 2);
        canvas.width = w;
        canvas.height = w * 2;
        
        if (engineRef.current) {
          // Re-init engine to recalculate block size on resize
          const oldState = engineRef.current.state;
          // Clean up old instance properly before re-creating
          engineRef.current.cleanup();
          
          engineRef.current = new LatteArtEngine(
            canvas,
            setGameState,
            handleLinesCleared
          );
          // Start it but pause if it was playing
          engineRef.current.state = oldState;
        }
      }
    };
    
    // Init Engine
    const canvas = canvasRef.current;
    
    // Set initial size
    canvas.width = 300;
    canvas.height = 600;

    engineRef.current = new LatteArtEngine(
      canvas,
      setGameState,
      handleLinesCleared
    );
    
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      if (engineRef.current) {
        engineRef.current.cleanup();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLinesCleared = useCallback((lines: number, score: number) => {
    addBeans(score);
    if (lines > 1) {
      setComboScore(score);
      setShowCombo(true);
      setTimeout(() => setShowCombo(false), 2000);
    }
  }, [addBeans]);

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

  const handleMobileControl = (key: string) => {
    if (!engineRef.current || !gameState.isPlaying || gameState.isGameOver || gameState.isPaused) return;
    
    const event = new KeyboardEvent('keydown', { code: key });
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col font-sans">
      <SEOHead 
        title="Latte Art Puzzle | Rose Coffee"
        description="Acomoda las piezas de café, rompe líneas y gana granos en este adictivo rompecabezas."
      />

      {/* Header */}
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
              <span className="text-gray-400 text-sm">Puntos</span>
              <span className="text-[#D4AF37] font-bold">{gameState.score}</span>
            </div>
            <div className="bg-[#1E293B] px-4 py-2 rounded-xl flex items-center gap-2 border border-white/5">
              <span className="text-gray-400 text-sm">Nivel</span>
              <span className="text-white font-bold">{gameState.level}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden" ref={containerRef}>
        
        {/* Combo Notification */}
        <AnimatePresence>
          {showCombo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.5, y: -50 }}
              className="absolute top-1/4 z-10 text-center pointer-events-none"
            >
              <div className="text-[#D4AF37] text-4xl md:text-6xl font-black italic drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]">
                ¡COMBO!
              </div>
              <div className="text-white font-bold text-2xl drop-shadow-lg">
                +{comboScore} Granos
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-2 border-white/10 bg-[#0F172A]">
          <canvas
            ref={canvasRef}
            className="block w-full max-w-[400px] h-auto aspect-[1/2]"
          />

          {/* Overlays */}
          <AnimatePresence>
            {!gameState.isPlaying && !gameState.isGameOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm"
              >
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Latte Art Puzzle</h1>
                <p className="text-gray-300 mb-8 max-w-xs text-sm">
                  Acomoda las piezas, completa líneas horizontales y gana granos de café exponencialmente.
                </p>
                <button
                  onClick={startGame}
                  className="bg-[#D4AF37] hover:bg-[#B3932F] text-black font-bold py-4 px-12 rounded-full transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 text-lg"
                >
                  <Play className="w-5 h-5 fill-current" />
                  JUGAR
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
                className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">¡Juego Terminado!</h2>
                <div className="text-[#D4AF37] text-5xl font-black mb-2">{gameState.score}</div>
                <div className="text-gray-400 mb-8">Puntos Obtenidos</div>
                
                <button
                  onClick={startGame}
                  className="bg-[#D4AF37] hover:bg-[#B3932F] text-black font-bold py-4 px-12 rounded-full transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 text-lg"
                >
                  <RotateCcw className="w-5 h-5" />
                  Jugar de Nuevo
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Controls */}
        {gameState.isPlaying && !gameState.isGameOver && (
          <div className="w-full max-w-[400px] mt-6 grid grid-cols-4 gap-2">
            <button 
              className="bg-white/10 p-4 rounded-xl flex items-center justify-center active:bg-white/20"
              onClick={() => handleMobileControl('ArrowLeft')}
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
            <button 
              className="bg-white/10 p-4 rounded-xl flex items-center justify-center active:bg-white/20"
              onClick={() => handleMobileControl('ArrowDown')}
            >
              <ChevronDown className="w-8 h-8 text-white" />
            </button>
            <button 
              className="bg-white/10 p-4 rounded-xl flex items-center justify-center active:bg-white/20"
              onClick={() => handleMobileControl('ArrowUp')}
            >
              <RefreshCw className="w-6 h-6 text-white" />
            </button>
            <button 
              className="bg-white/10 p-4 rounded-xl flex items-center justify-center active:bg-white/20"
              onClick={() => handleMobileControl('ArrowRight')}
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          </div>
        )}
      </main>
      
      {/* Footer Controls (Pause) */}
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
