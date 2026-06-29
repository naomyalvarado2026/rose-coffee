import React from 'react';
import { useGameEngine } from '../../hooks/useGameEngine';
import GameUIOverlay from './GameUIOverlay';

const KittenGame: React.FC = () => {
  const {
    canvasRef,
    gameState,
    score,
    lives,
    startGame,
  } = useGameEngine({});

  return (
    <div className="relative w-full h-full overflow-hidden select-none touch-none">
      <canvas 
        ref={canvasRef}
        className="block w-full h-full cursor-pointer"
        style={{ touchAction: 'none' }}
      />
      <GameUIOverlay 
        gameState={gameState} 
        score={score} 
        lives={lives} 
        onStart={startGame} 
      />
    </div>
  );
};

export default KittenGame;
