import React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Heart } from 'lucide-react';
import type { GameState } from '../../hooks/useGameEngine';

interface GameUIOverlayProps {
  gameState: GameState;
  score: number;
  lives: number;
  onStart: () => void;
}

const GameUIOverlay: React.FC<GameUIOverlayProps> = ({ gameState, score, lives, onStart }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      {/* HUD */}
      <div className="flex justify-between items-start w-full">
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{ 
                scale: i < lives ? 1 : 0.8,
                opacity: i < lives ? 1 : 0.3,
                filter: i < lives ? 'grayscale(0%)' : 'grayscale(100%)'
              }}
            >
              <Heart className="w-8 h-8 text-accent-red fill-current" />
            </motion.div>
          ))}
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg border border-primary/10">
          <span className="text-xl font-bold text-primary font-mono">
            {String(score).padStart(5, '0')}
          </span>
        </div>
      </div>

      {/* Menus */}
      <div className="flex-1 flex items-center justify-center">
        {gameState === 'START' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-primary/10 text-center pointer-events-auto max-w-sm"
          >
            <h2 className="text-3xl font-extrabold text-primary mb-2">Gatito Runner</h2>
            <p className="text-primary/70 mb-6">Toca la pantalla o usa la barra espaciadora para saltar.</p>
            <button 
              onClick={onStart}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-coffee transition-colors shadow-lg shadow-primary/20"
            >
              <Play className="w-6 h-6 fill-current" />
              INICIAR JUEGO
            </button>
          </motion.div>
        )}

        {gameState === 'GAME_OVER' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-accent-red/20 text-center pointer-events-auto max-w-sm"
          >
            <h2 className="text-4xl font-extrabold text-accent-red mb-2">¡Ouch!</h2>
            <p className="text-primary/70 mb-2">Te has quedado sin vidas.</p>
            <p className="text-xl font-bold text-primary mb-6 border-y border-primary/10 py-3">
              Puntuación Final: <span className="font-mono text-coffee dark:text-gold">{String(score).padStart(5, '0')}</span>
            </p>
            <button 
              onClick={onStart}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-coffee transition-colors shadow-lg shadow-primary/20"
            >
              <RotateCcw className="w-6 h-6" />
              JUGAR DE NUEVO
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GameUIOverlay;
