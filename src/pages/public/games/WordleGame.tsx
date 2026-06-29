import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Trophy, AlertCircle, Info, BarChart2, Delete, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGameWallet } from '../../../contexts/GameWalletContext';
import { getRandomWord, VALID_GUESSES } from '../../../components/games/WordleGame/wordList';
import SEOHead from '../../../components/common/SEOHead';
import Confetti from '../../../components/games/common/Confetti';
import { audio } from '../../../utils/audioEngine';

type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

interface GuessRow {
  letters: string[];
  statuses: LetterStatus[];
}

interface GameStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[];
}

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

const loadStats = (): GameStats => {
  try {
    const saved = localStorage.getItem('wordle_stats');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return { played: 0, wins: 0, currentStreak: 0, maxStreak: 0, distribution: [0, 0, 0, 0, 0, 0] };
};

const saveStats = (stats: GameStats) => {
  localStorage.setItem('wordle_stats', JSON.stringify(stats));
};

// Modals
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }} 
          animate={{ scale: 1, y: 0 }} 
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b dark:border-stone-700">
            <h2 className="text-xl font-bold font-serif text-stone-800 dark:text-stone-100">{title}</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
              <X size={20} className="text-stone-500 dark:text-stone-400" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const WordleGame: React.FC = () => {
  const { addBeans } = useGameWallet();
  const [targetWord, setTargetWord] = useState(() => getRandomWord());
  const [guesses, setGuesses] = useState<GuessRow[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [didWin, setDidWin] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [showHelp, setShowHelp] = useState(() => !localStorage.getItem('wordle_stats'));
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<GameStats>(loadStats);

  // Initialize game
  const initGame = useCallback(() => {
    setTargetWord(getRandomWord());
    setGuesses([]);
    setCurrentGuess('');
    setIsGameOver(false);
    setDidWin(false);
    setMessage(null);
  }, []);

  const showMessage = (msg: string, duration = 2000) => {
    setMessage(msg);
    if (duration > 0) {
      setTimeout(() => setMessage(null), duration);
    }
  };

  const calculateReward = (attempts: number) => {
    // Better rewards: exponential based on how fast you got it
    const rewards = [200, 150, 100, 60, 40, 20];
    return rewards[attempts - 1] || 20;
  };

  const updateStats = useCallback((win: boolean, attempts: number) => {
    setStats(prev => {
      const newStats = { ...prev };
      newStats.played += 1;
      if (win) {
        newStats.wins += 1;
        newStats.currentStreak += 1;
        newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
        newStats.distribution[attempts - 1] += 1;
      } else {
        newStats.currentStreak = 0;
      }
      saveStats(newStats);
      return newStats;
    });
    
    // Automatically show stats after game over (delayed)
    setTimeout(() => {
      setShowStats(true);
    }, 2000);
  }, []);

  const onKeyPress = useCallback((key: string) => {
    if (isGameOver || showHelp || showStats) return;

    if (key === 'ENTER') {
      if (currentGuess.length !== WORD_LENGTH) {
        showMessage('Faltan letras');
        setShake(true);
        audio.playHurt();
        setTimeout(() => setShake(false), 500);
        return;
      }
      
      if (!VALID_GUESSES.has(currentGuess.toLowerCase()) && !VALID_GUESSES.has(currentGuess)) {
        showMessage('La palabra no está en la lista');
        setShake(true);
        audio.playHurt();
        setTimeout(() => setShake(false), 500);
        return;
      }

      // Check guess
      const newGuesses = [...guesses];
      const statuses: LetterStatus[] = Array(WORD_LENGTH).fill('absent');
      const targetChars = targetWord.split('');
      const guessChars = currentGuess.split('');

      // First pass: find correct letters
      guessChars.forEach((char, i) => {
        if (char === targetChars[i]) {
          statuses[i] = 'correct';
          targetChars[i] = ''; // mark as used
        }
      });

      // Second pass: find present letters
      guessChars.forEach((char, i) => {
        if (statuses[i] !== 'correct' && targetChars.includes(char)) {
          statuses[i] = 'present';
          targetChars[targetChars.indexOf(char)] = ''; // mark as used
        }
      });

      newGuesses.push({
        letters: guessChars,
        statuses
      });

      setGuesses(newGuesses);
      setCurrentGuess('');

      if (currentGuess === targetWord) {
        setIsGameOver(true);
        setDidWin(true);
        const reward = calculateReward(newGuesses.length);
        addBeans(reward);
        
        // Delay win sound to wait for flip animation
        setTimeout(() => {
          audio.playPowerUp();
          showMessage(`¡Felicidades! Ganaste ${reward} Granos`, 0);
          updateStats(true, newGuesses.length);
        }, WORD_LENGTH * 300);
        
      } else if (newGuesses.length >= MAX_GUESSES) {
        setIsGameOver(true);
        setTimeout(() => {
          audio.playHurt();
          showMessage(`La palabra era ${targetWord}`, 0);
          updateStats(false, newGuesses.length);
        }, WORD_LENGTH * 300);
      } else {
        // Just a row submit sound
        audio.playCoin();
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
      audio.playJump();
    } else if (currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(prev => prev + key);
      audio.playJump();
    }
  }, [currentGuess, guesses, isGameOver, targetWord, addBeans, showHelp, showStats, updateStats]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not capture keyboard if a modal is open
      if (showHelp || showStats) {
        if (e.key === 'Escape') {
          setShowHelp(false);
          setShowStats(false);
        }
        return;
      }
      
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      
      if (e.key === 'Enter') {
        onKeyPress('ENTER');
      } else if (e.key === 'Backspace') {
        onKeyPress('BACKSPACE');
      } else if (/^[A-Za-zÑñ]$/.test(e.key)) {
        onKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress, showHelp, showStats]);

  // Helper to get keyboard key status
  const getKeyStatus = (key: string): LetterStatus | 'default' => {
    let status: LetterStatus | 'default' = 'default';
    for (const guess of guesses) {
      guess.letters.forEach((letter, i) => {
        if (letter === key) {
          const letterStatus = guess.statuses[i];
          if (letterStatus === 'correct') {
            status = 'correct'; // correct overrides anything
          } else if (letterStatus === 'present' && status !== 'correct') {
            status = 'present';
          } else if (letterStatus === 'absent' && status === 'default') {
            status = 'absent';
          }
        }
      });
    }
    return status;
  };

  return (
    <div className="min-h-screen pt-36 pb-8 px-4 lg:px-8 font-sans text-stone-100 bg-stone-950 flex flex-col items-center relative overflow-hidden">
       <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
           backgroundImage: 'radial-gradient(#d97706 1px, transparent 1px)',
           backgroundSize: '24px 24px'
        }}></div>
      <SEOHead 
        title="La Palabra del Día | Rose Coffee" 
        description="Adivina la palabra oculta relacionada con el mundo del café."
      />
      
      <Confetti active={didWin} />

      {/* Help Modal */}
      <Modal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo Jugar">
        <div className="space-y-4 text-stone-600 dark:text-stone-300">
          <p>Adivina <strong>La Palabra del Día</strong> en 6 intentos.</p>
          <p>Cada intento debe ser una palabra válida de 5 letras. Pulsa el botón ENTER para enviar.</p>
          <p>Después de cada intento el color de las letras cambia para mostrar qué tan cerca estás de acertar la palabra.</p>
          
            <div className="border-t border-stone-700 pt-4 mt-4">
            <h3 className="font-bold mb-3 text-amber-500">Ejemplos</h3>
            <div className="flex gap-2 mb-2">
              <div className="w-10 h-10 bg-emerald-600 text-white flex items-center justify-center font-bold text-lg rounded-lg shadow-inner">G</div>
              <div className="w-10 h-10 bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-lg rounded-lg">R</div>
              <div className="w-10 h-10 bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-lg rounded-lg">A</div>
              <div className="w-10 h-10 bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-lg rounded-lg">N</div>
              <div className="w-10 h-10 bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-lg rounded-lg">O</div>
            </div>
            <p className="text-sm mb-5 text-stone-400">La letra <strong>G</strong> está en la palabra y en la posición correcta.</p>

            <div className="flex gap-2 mb-2">
              <div className="w-10 h-10 bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-lg rounded-lg">L</div>
              <div className="w-10 h-10 bg-amber-600 text-white flex items-center justify-center font-bold text-lg rounded-lg shadow-inner">E</div>
              <div className="w-10 h-10 bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-lg rounded-lg">C</div>
              <div className="w-10 h-10 bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-lg rounded-lg">H</div>
              <div className="w-10 h-10 bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-lg rounded-lg">E</div>
            </div>
            <p className="text-sm mb-5 text-stone-400">La letra <strong>E</strong> está en la palabra pero en la posición incorrecta.</p>

            <div className="flex gap-2 mb-2">
              <div className="w-10 h-10 bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-lg rounded-lg">C</div>
              <div className="w-10 h-10 bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-lg rounded-lg">A</div>
              <div className="w-10 h-10 bg-stone-700 text-stone-400 flex items-center justify-center font-bold text-lg rounded-lg shadow-inner">C</div>
              <div className="w-10 h-10 bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-lg rounded-lg">A</div>
              <div className="w-10 h-10 bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-lg rounded-lg">O</div>
            </div>
            <p className="text-sm">La letra <strong>C</strong> no está en la palabra en ninguna posición.</p>
          </div>
          
          <div className="border-t dark:border-stone-700 pt-4 mt-4">
            <h3 className="font-bold mb-2">Recompensas</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>1 intento: <span className="font-bold text-amber-600 dark:text-amber-400">200 Granos</span></li>
              <li>2 intentos: <span className="font-bold text-amber-600 dark:text-amber-400">150 Granos</span></li>
              <li>3 intentos: <span className="font-bold text-amber-600 dark:text-amber-400">100 Granos</span></li>
              <li>4 intentos: <span className="font-bold text-amber-600 dark:text-amber-400">60 Granos</span></li>
              <li>5 intentos: <span className="font-bold text-amber-600 dark:text-amber-400">40 Granos</span></li>
              <li>6 intentos: <span className="font-bold text-amber-600 dark:text-amber-400">20 Granos</span></li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Stats Modal */}
      <Modal isOpen={showStats} onClose={() => setShowStats(false)} title="Estadísticas">
        <div className="flex flex-col items-center">
          <div className="flex gap-4 w-full justify-center mb-6 text-center">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-stone-800 dark:text-white">{stats.played}</span>
              <span className="text-xs text-stone-500 uppercase tracking-wide">Jugadas</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-stone-800 dark:text-white">
                {stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0}
              </span>
              <span className="text-xs text-stone-500 uppercase tracking-wide">% Victorias</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-stone-800 dark:text-white">{stats.currentStreak}</span>
              <span className="text-xs text-stone-500 uppercase tracking-wide">Racha<br/>Actual</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-stone-800 dark:text-white">{stats.maxStreak}</span>
              <span className="text-xs text-stone-500 uppercase tracking-wide">Mejor<br/>Racha</span>
            </div>
          </div>
          
          <h3 className="font-bold mb-4 w-full text-left border-b pb-2 dark:border-stone-700">Distribución de Intentos</h3>
          <div className="w-full space-y-2 mb-6">
            {stats.distribution.map((count, i) => {
              const maxVal = Math.max(...stats.distribution, 1);
              const percent = Math.max(7, Math.round((count / maxVal) * 100)); // min 7% for visibility
              const isCurrent = didWin && guesses.length === i + 1;
              return (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-2">{i + 1}</div>
                  <div className="flex-1 bg-stone-100 dark:bg-stone-800 h-6 rounded overflow-hidden flex">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full flex items-center justify-end px-2 text-white font-bold text-xs ${isCurrent ? 'bg-emerald-500' : 'bg-stone-500 dark:bg-stone-600'}`}
                    >
                      {count > 0 ? count : ''}
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <button
            onClick={() => setShowStats(false)}
            className="w-full py-3 bg-stone-800 hover:bg-stone-900 dark:bg-stone-200 dark:hover:bg-white dark:text-stone-900 text-white font-bold rounded-lg transition-colors"
          >
            Aceptar
          </button>
        </div>
      </Modal>

      <div className="w-full max-w-lg mb-6 flex justify-between items-center px-2 z-10">
        <Link 
          to="/juegos" 
          className="inline-flex items-center gap-2 px-3 py-2 bg-stone-900 text-stone-300 rounded-full border border-stone-800 shadow-sm hover:bg-stone-800 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Volver</span>
        </Link>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowHelp(true)}
            className="p-2 bg-stone-900 text-stone-300 rounded-full border border-stone-800 shadow-sm hover:bg-stone-800 transition-colors"
            title="Cómo Jugar"
          >
            <Info size={18} />
          </button>
          <button 
            onClick={() => setShowStats(true)}
            className="p-2 bg-stone-900 text-stone-300 rounded-full border border-stone-800 shadow-sm hover:bg-stone-800 transition-colors"
            title="Estadísticas"
          >
            <BarChart2 size={18} />
          </button>
          <div className="flex items-center gap-1 px-3 py-2 bg-amber-900/40 text-amber-300 border border-amber-800/50 rounded-full font-bold shadow-sm text-sm">
            <Trophy size={16} />
            <span className="hidden sm:inline">Recompensas</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-lg flex flex-col flex-1 max-h-[800px]">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-serif font-bold text-rose-900 dark:text-rose-300 tracking-tight">
            La Palabra del Día
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Escribe una palabra de 5 letras y pulsa ENTER</p>
        </div>

        {/* Message toast */}
        <div className="h-10 flex justify-center items-center mb-2 relative z-10">
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-stone-900 text-white px-4 py-2 rounded-lg font-bold shadow-xl flex items-center gap-2 border-b-4 border-black/30 text-sm sm:text-base"
              >
                {didWin ? <Trophy size={18} className="text-yellow-400" /> : <AlertCircle size={18} />}
                {message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Board */}
        <div className="flex-1 flex flex-col justify-center items-center gap-1.5 sm:gap-2 mb-6 mt-2">
          {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
            const isCurrentRow = rowIndex === guesses.length;
            const guess = guesses[rowIndex];
            
            return (
              <motion.div 
                key={rowIndex} 
                className="flex gap-1.5 sm:gap-2"
                animate={isCurrentRow && shake ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                  let letter = '';
                  let status: LetterStatus = 'empty';
                  
                  if (guess) {
                    letter = guess.letters[colIndex];
                    status = guess.statuses[colIndex];
                  } else if (isCurrentRow && colIndex < currentGuess.length) {
                    letter = currentGuess[colIndex];
                  }

                  const getStyles = () => {
                    switch (status) {
                      case 'correct': return 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]';
                      case 'present': return 'bg-amber-500 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]';
                      case 'absent': return 'bg-stone-800 border-stone-700 text-stone-500';
                      default: return 'bg-stone-900/50 border-stone-700 text-stone-100';
                    }
                  };

                  const isPulsing = isCurrentRow && colIndex === currentGuess.length;

                  return (
                    <div 
                      key={colIndex}
                      className={`relative w-[3.5rem] h-[3.5rem] sm:w-[4rem] sm:h-[4rem] flex items-center justify-center text-3xl font-black uppercase [perspective:1000px]`}
                    >
                      <motion.div
                        className={`absolute inset-0 border-2 rounded-xl flex items-center justify-center [backface-visibility:hidden] ${
                          letter && status === 'empty' ? 'border-amber-700 scale-[1.05] shadow-[0_0_10px_rgba(180,83,9,0.3)] bg-stone-900 text-white' : ''
                        } ${isPulsing ? 'border-amber-600 border-b-4' : ''} ${getStyles()}`}
                        initial={status !== 'empty' ? { rotateX: -90 } : false}
                        animate={status !== 'empty' ? { rotateX: 0 } : (isPulsing ? { opacity: [0.5, 1, 0.5] } : {})}
                        transition={isPulsing ? { repeat: Infinity, duration: 1.5 } : { delay: colIndex * 0.15, duration: 0.5, type: 'spring', bounce: 0.4 }}
                      >
                        {letter}
                      </motion.div>
                    </div>
                  );
                })}
              </motion.div>
            );
          })}
        </div>

        {/* Game Over Actions */}
        <AnimatePresence>
           {isGameOver && (
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex flex-col items-center justify-center mt-4 mb-4 z-10"
              >
                 <button
                   onClick={initGame}
                   className="flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-bold shadow-lg shadow-amber-900/50 transition-all hover:scale-105"
                 >
                   <RefreshCw className="w-5 h-5" />
                   Jugar de Nuevo
                 </button>
              </motion.div>
           )}
        </AnimatePresence>

        {/* Keyboard */}
        <div className={`w-full flex flex-col gap-1.5 sm:gap-2 mt-auto z-10 transition-opacity ${isGameOver ? 'opacity-50 pointer-events-none' : ''}`}>
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1 sm:gap-1.5">
              {row.map((key) => {
                const status = getKeyStatus(key);
                const isEnter = key === 'ENTER';
                const isBackspace = key === 'BACKSPACE';
                const isSpecial = isEnter || isBackspace;
                
                const getBgColor = () => {
                  switch (status) {
                    case 'correct': return 'bg-emerald-600 text-white shadow-[0_4px_0_0_#047857] active:shadow-[0_0px_0_0_#047857] active:translate-y-[4px] border border-emerald-700';
                    case 'present': return 'bg-amber-600 text-white shadow-[0_4px_0_0_#b45309] active:shadow-[0_0px_0_0_#b45309] active:translate-y-[4px] border border-amber-700';
                    case 'absent': return 'bg-stone-800 text-stone-500 shadow-[0_4px_0_0_#1c1917] active:shadow-[0_0px_0_0_#1c1917] active:translate-y-[4px] border border-stone-900';
                    default: return 'bg-stone-800/80 text-stone-200 shadow-[0_4px_0_0_#292524] active:shadow-[0_0px_0_0_#292524] active:translate-y-[4px] border border-stone-700';
                  }
                };

                return (
                  <button
                    key={key}
                    onClick={() => onKeyPress(key)}
                    className={`h-[3.5rem] rounded-lg font-bold transition-all select-none flex justify-center items-center overflow-hidden ${
                      isSpecial ? 'px-3 sm:px-4 text-[11px] sm:text-xs tracking-wider min-w-[3.5rem] sm:min-w-[4rem]' : 'flex-1 text-sm sm:text-base max-w-[40px] sm:max-w-[44px]'
                    } ${getBgColor()}`}
                  >
                    {isBackspace ? (
                      <Delete size={20} className="stroke-[2.5]" />
                    ) : isEnter ? (
                      'ENTER'
                    ) : (
                      key
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Play Again */}
        <AnimatePresence>
          {isGameOver && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex justify-center"
            >
              <button
                onClick={initGame}
                className="flex items-center gap-2 px-8 py-3.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold rounded-full shadow-[0_4px_0_0_#9f1239] active:shadow-[0_0px_0_0_#9f1239] active:translate-y-[4px] transition-all"
              >
                <RefreshCw size={20} />
                <span className="tracking-wide">JUGAR DE NUEVO</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WordleGame;
