import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy, Coffee, Droplet, Sprout, Leaf, CupSoda, Flame, Users, Crown, Settings2 } from 'lucide-react';
import { useGameWallet } from '../../../contexts/GameWalletContext';
import SEOHead from '../../../components/common/SEOHead';
import Confetti from '../../../components/games/common/Confetti';
import { audio } from '../../../utils/audioEngine';

// Define the Evolution Chain (11 levels up to 2048)
const EVOLUTION_CHAIN = [
  { level: 1, name: 'Agua', icon: Droplet, color: 'bg-blue-200 text-blue-700', value: 2 },
  { level: 2, name: 'Semilla', icon: Sprout, color: 'bg-emerald-200 text-emerald-800', value: 4 },
  { level: 3, name: 'Planta', icon: Leaf, color: 'bg-green-300 text-green-900', value: 8 },
  { level: 4, name: 'Grano Verde', icon: Droplet, color: 'bg-lime-200 text-lime-800', value: 16 },
  { level: 5, name: 'Grano Tostado', icon: Coffee, color: 'bg-stone-300 text-stone-800', value: 32 },
  { level: 6, name: 'Molienda', icon: Settings2, color: 'bg-amber-300 text-amber-900', value: 64 },
  { level: 7, name: 'Espresso', icon: CupSoda, color: 'bg-orange-300 text-orange-900', value: 128 },
  { level: 8, name: 'Americano', icon: Flame, color: 'bg-red-300 text-red-900', value: 256 },
  { level: 9, name: 'Cappuccino', icon: Coffee, color: 'bg-rose-300 text-rose-900', value: 512 },
  { level: 10, name: 'Arte Latte', icon: Users, color: 'bg-fuchsia-300 text-fuchsia-900', value: 1024 },
  { level: 11, name: 'Rose Master', icon: Crown, color: 'bg-yellow-400 text-yellow-900 font-bold', value: 2048 },
];

interface TileData {
  id: string; // Unique ID for animations
  level: number;
  r: number;
  c: number;
  isNew?: boolean;
  isMerged?: boolean;
}

const Evolution2048: React.FC = () => {
  const [board, setBoard] = useState<TileData[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const best = localStorage.getItem('evolution_2048_best');
    return best ? parseInt(best, 10) : 0;
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const { addBeans } = useGameWallet();
  const boardRef = useRef(board);
  const scoreRef = useRef(score);

  useEffect(() => {
    boardRef.current = board;
    scoreRef.current = score;
  }, [board, score]);

  const initializeGame = useCallback(() => {
    const initialBoard: TileData[] = [];
    
    // Inline functions to avoid dependency cycles
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        emptyCells.push({ r, c });
      }
    }
    
    if (emptyCells.length > 0) {
      const idx1 = Math.floor(Math.random() * emptyCells.length);
      const cell1 = emptyCells.splice(idx1, 1)[0];
      initialBoard.push({
        id: Math.random().toString(36).substring(2, 9),
        level: Math.random() < 0.9 ? 1 : 2,
        r: cell1.r,
        c: cell1.c,
        isNew: true
      });
      
      if (emptyCells.length > 0) {
        const idx2 = Math.floor(Math.random() * emptyCells.length);
        const cell2 = emptyCells.splice(idx2, 1)[0];
        initialBoard.push({
          id: Math.random().toString(36).substring(2, 9),
          level: Math.random() < 0.9 ? 1 : 2,
          r: cell2.r,
          c: cell2.c,
          isNew: true
        });
      }
    }

    setBoard(initialBoard);
    setScore(0);
    setIsGameOver(false);
    setIsWinner(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => initializeGame(), 0);
    return () => clearTimeout(timer);
  }, [initializeGame]);

  const getEmptyCells = useCallback((currentBoard: TileData[]) => {
    const empty = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!currentBoard.find(t => t.r === r && t.c === c)) {
          empty.push({ r, c });
        }
      }
    }
    return empty;
  }, []);

  const addRandomTile = useCallback((currentBoard: TileData[]) => {
    const emptyCells = getEmptyCells(currentBoard);
    if (emptyCells.length === 0) return;
    
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newTile: TileData = {
      id: Math.random().toString(36).substring(2, 9),
      level: Math.random() < 0.9 ? 1 : 2, // 90% chance of level 1, 10% chance of level 2
      r: randomCell.r,
      c: randomCell.c,
      isNew: true
    };
    currentBoard.push(newTile);
  }, [getEmptyCells]);

  const checkGameOver = useCallback((currentBoard: TileData[], currentScore: number) => {
    const emptyCells = getEmptyCells(currentBoard);
    if (emptyCells.length > 0) return;

    let hasMoves = false;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const tile = currentBoard.find(t => t.r === r && t.c === c);
        if (!tile) continue;
        
        const neighbors = [
          currentBoard.find(t => t.r === r - 1 && t.c === c),
          currentBoard.find(t => t.r === r + 1 && t.c === c),
          currentBoard.find(t => t.r === r && t.c === c - 1),
          currentBoard.find(t => t.r === r && t.c === c + 1)
        ];

        if (neighbors.some(n => n && n.level === tile.level)) {
          hasMoves = true;
          break;
        }
      }
      if (hasMoves) break;
    }

    if (!hasMoves) {
      setIsGameOver(true);
      // Award beans
      const awarded = Math.max(5, Math.floor(currentScore / 10));
      addBeans(awarded);
    }
  }, [getEmptyCells, addBeans]);

  const move = useCallback((direction: string) => {
    const currentBoard = [...boardRef.current];
    let hasMoved = false;
    let addedScore = 0;

    // Reset isNew and isMerged
    const workingBoard = currentBoard.map(t => ({ ...t, isNew: false, isMerged: false }));

    const getTile = (r: number, c: number) => workingBoard.find(t => t.r === r && t.c === c);
    
    // Core 2048 shift logic
    const shiftVector = (r: number, c: number, dr: number, dc: number) => {
      let cr = r;
      let cc = c;
      while (cr + dr >= 0 && cr + dr < 4 && cc + dc >= 0 && cc + dc < 4) {
        if (!getTile(cr + dr, cc + dc)) {
           cr += dr;
           cc += dc;
        } else {
           break;
        }
      }
      return { r: cr, c: cc };
    };

    const processDirection = (dr: number, dc: number, rows: number[], cols: number[]) => {
      for (const r of rows) {
        for (const c of cols) {
          const tile = getTile(r, c);
          if (tile) {
            const dest = shiftVector(r, c, dr, dc);
            const nextR = dest.r + dr;
            const nextC = dest.c + dc;
            const nextTile = (nextR >= 0 && nextR < 4 && nextC >= 0 && nextC < 4) ? getTile(nextR, nextC) : null;

            if (nextTile && nextTile.level === tile.level && !nextTile.isMerged && tile.level < 11) {
              // Merge
              tile.r = nextR;
              tile.c = nextC;
              tile.level += 1;
              tile.isMerged = true;
              
              if (tile.level === 11) {
                setIsWinner(true);
                audio.playPowerUp();
              } else {
                audio.playCoin();
              }

              // Remove old tile from array (the one we merged into)
              const idx = workingBoard.indexOf(nextTile);
              if (idx > -1) workingBoard.splice(idx, 1);
              
              hasMoved = true;
              addedScore += EVOLUTION_CHAIN[tile.level - 1].value;
            } else if (dest.r !== r || dest.c !== c) {
              // Move
              tile.r = dest.r;
              tile.c = dest.c;
              hasMoved = true;
            }
          }
        }
      }
    };

    if (direction === 'ArrowUp') processDirection(-1, 0, [1, 2, 3], [0, 1, 2, 3]);
    if (direction === 'ArrowDown') processDirection(1, 0, [2, 1, 0], [0, 1, 2, 3]);
    if (direction === 'ArrowLeft') processDirection(0, -1, [0, 1, 2, 3], [1, 2, 3]);
    if (direction === 'ArrowRight') processDirection(0, 1, [0, 1, 2, 3], [2, 1, 0]);

    if (hasMoved) {
      if (addedScore === 0) audio.playJump();
      addRandomTile(workingBoard);
      setBoard(workingBoard);
      
      const newScore = scoreRef.current + addedScore;
      setScore(newScore);
      
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('evolution_2048_best', newScore.toString());
      }
      
      checkGameOver(workingBoard, newScore);
    }
  }, [bestScore, addRandomTile, checkGameOver]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isGameOver) return;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      move(e.key);
    }
  }, [isGameOver, move]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // Touch Handling for Swipes
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || isGameOver) return;
    
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) move(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
    } else {
      if (Math.abs(dy) > 30) move(dy > 0 ? 'ArrowDown' : 'ArrowUp');
    }
    setTouchStart(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-8 px-4 lg:px-8 font-sans text-primary dark:text-stone-100 bg-stone-50 dark:bg-stone-900 flex flex-col">
      <SEOHead 
        title="Evolución 2048 | Rose Coffee" 
        description="Combina los elementos para crear el café perfecto."
      />
      
      <Confetti active={isWinner} />

      <div className="w-full max-w-lg mx-auto mb-6 flex flex-col">
        <div className="flex justify-between items-center w-full mb-4">
          <Link 
            to="/juegos" 
            className="inline-flex items-center gap-2 text-primary/70 dark:text-stone-400 hover:text-coffee dark:hover:text-gold transition-colors font-semibold text-sm uppercase tracking-wider"
          >
            <ArrowLeft size={16} /> Volver
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-6 gap-4 w-full">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">Evolución 2048</h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 hidden sm:block">Combina para crear el café perfecto.</p>
          </div>
          
          <div className="flex gap-4 bg-white dark:bg-stone-800 p-2 sm:p-3 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700">
            <div className="text-center px-2">
              <div className="text-[10px] sm:text-xs uppercase font-bold text-stone-500 dark:text-stone-400 tracking-wider mb-0.5">Puntaje</div>
              <motion.div 
                key={score}
                initial={{ scale: 1.5, color: '#d97706' }}
                animate={{ scale: 1, color: 'currentColor' }}
                className="text-lg font-bold font-mono"
              >
                {score}
              </motion.div>
            </div>
            <div className="text-center px-2 text-gold">
              <div className="text-[10px] sm:text-xs uppercase font-bold tracking-wider mb-0.5 flex justify-center items-center gap-1"><Trophy size={10}/> Mejor</div>
              <div className="text-lg font-bold font-mono">{bestScore}</div>
            </div>
            <button 
              onClick={initializeGame}
              className="px-2 text-stone-500 hover:text-coffee dark:hover:text-gold transition-colors flex items-center justify-center"
              title="Reiniciar"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Game Board container */}
        <div 
          className="relative w-full max-w-[500px] aspect-square mx-auto bg-stone-300 dark:bg-stone-800 rounded-xl p-2 sm:p-3"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="grid grid-cols-4 grid-rows-4 gap-2 sm:gap-3 w-full h-full absolute inset-0 p-2 sm:p-3">
            {/* Background Grid */}
            {Array.from({ length: 16 }).map((_, i) => (
              <div 
                key={`bg-${i}`} 
                className="bg-stone-200 dark:bg-stone-700 rounded-lg w-full h-full opacity-50"
                style={{ gridColumn: (i % 4) + 1, gridRow: Math.floor(i / 4) + 1 }}
              ></div>
            ))}

            {/* Foreground Tiles */}
            <AnimatePresence>
              {board.map(tile => {
                const spec = EVOLUTION_CHAIN[tile.level - 1];
                const Icon = spec.icon;
                
                return (
                  <motion.div
                    key={tile.id}
                    layout
                    initial={tile.isNew ? { scale: 0, opacity: 0 } : false}
                    animate={{ 
                      scale: tile.isMerged ? [1, 1.2, 1] : 1, 
                      opacity: 1
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 250,
                      damping: 25,
                      mass: 1,
                      scale: { duration: 0.2 }
                    }}
                    className={`rounded-lg shadow-sm flex flex-col items-center justify-center text-center p-1 overflow-hidden z-10 w-full h-full ${spec.color}`}
                    style={{
                      gridColumn: tile.c + 1,
                      gridRow: tile.r + 1,
                    }}
                  >
                    <Icon size={24} className="opacity-80 mb-1" />
                    <span className="text-[10px] sm:text-xs font-bold leading-tight uppercase tracking-tight">{spec.name}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          
          {/* Game Over Overlay */}
          <AnimatePresence>
            {isGameOver && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-stone-900/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="bg-white dark:bg-stone-800 p-8 rounded-2xl shadow-xl max-w-sm w-full">
                  <h2 className="text-3xl font-extrabold mb-2 text-stone-900 dark:text-white">Fin del Juego</h2>
                  <p className="text-stone-600 dark:text-stone-400 mb-6 font-medium">
                    Puntuación: {score} <br/>
                    <span className="text-coffee dark:text-gold flex items-center justify-center gap-1 mt-2">
                      <Coffee size={16}/> +{Math.max(5, Math.floor(score / 10))} Granos
                    </span>
                  </p>
                  <button 
                    onClick={initializeGame}
                    className="w-full bg-coffee hover:bg-amber-900 text-white py-3 rounded-full font-bold uppercase tracking-wider transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={18} /> Jugar de Nuevo
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Evolution2048;
