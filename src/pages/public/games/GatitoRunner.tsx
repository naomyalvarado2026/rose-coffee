import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw, Heart, Trophy, Crown, Coffee } from 'lucide-react';
import { useGameWallet } from '../../../contexts/GameWalletContext';
import { 
  GatitoEngine, 
  GATITO_SKINS, 
  DEFAULT_GATITO 
} from '../../../components/games/GatitoRunner/Engine';
import { submitScore, getTopScores, type LeaderboardEntry } from '../../../utils/leaderboard';
import {
  getCatSvg,
  BREAD_SVG,
  CROISSANT_SVG,
  DONUT_SVG,
  BIRD_SVG_1,
  BIRD_SVG_2,
  COFFEE_SPILL_SVG,
  COIN_SVG,
  ESPRESSO_SHOT_SVG,
  LATTE_ART_SVG,
  BEAN_PROJECTILE_SVG,
  BOSS_SVG_NORMAL,
  BOSS_SVG_ANGRY,
  POWERUP_SHIELD_SVG,
  POWERUP_MAGNET_SVG,
  BOSS_PROJECTILE_SVG,
  loadSprite
} from '../../../components/games/GatitoRunner/Sprites';
import SEOHead from '../../../components/common/SEOHead';
import { MobileGameController } from '../../../components/games/common/MobileGameController';

const GatitoRunner: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GatitoEngine | null>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(() => {
    const savedScore = localStorage.getItem('gatito_runner_highscore');
    return savedScore ? parseInt(savedScore, 10) : 0;
  });
  const [bossActive, setBossActive] = useState(false);
  const [awardedBeans, setAwardedBeans] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [combo, setCombo] = useState(0);
  const [ammo, setAmmo] = useState(3);
  
  const isPausedRef = useRef(false);
  useEffect(() => {
     isPausedRef.current = isPaused;
  }, [isPaused]);

  const { beans, addBeans, spendBeans } = useGameWallet();
  const [unlockedCats, setUnlockedCats] = useState<string[]>(() => {
    const saved = localStorage.getItem('gatito_unlocked');
    return saved ? JSON.parse(saved) : ['street'];
  });
  const [selectedCatId, setSelectedCatId] = useState<string>(() => {
    return localStorage.getItem('gatito_selected') || 'street';
  });

  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    getTopScores().then(setLeaderboard);
  }, []);

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      await submitScore(playerName.trim(), score);
      const updated = await getTopScores();
      setLeaderboard(updated);
      setShowLeaderboard(true);
    }
  };

  const buyCat = (catId: string, price: number) => {
    if (spendBeans(price)) {
      const newUnlocked = [...unlockedCats, catId];
      setUnlockedCats(newUnlocked);
      localStorage.setItem('gatito_unlocked', JSON.stringify(newUnlocked));
      selectCat(catId);
    } else {
      alert("¡No tienes suficientes Granos de Café!");
    }
  };

  const selectCat = (catId: string) => {
    setSelectedCatId(catId);
    localStorage.setItem('gatito_selected', catId);
    setIsLoaded(false); // Reload resources for new color
  };

  useEffect(() => {
    const initGame = async () => {
      try {
        const config = GATITO_SKINS.find(c => c.id === selectedCatId) || DEFAULT_GATITO;
        
        const sprites = {
          'cat_run1': await loadSprite(getCatSvg('run1', config.color, config.apronColor)),
          'cat_run2': await loadSprite(getCatSvg('run2', config.color, config.apronColor)),
          'cat_jump': await loadSprite(getCatSvg('jump', config.color, config.apronColor)),
          'cat_crouch1': await loadSprite(getCatSvg('crouch1', config.color, config.apronColor)),
          'cat_crouch2': await loadSprite(getCatSvg('crouch2', config.color, config.apronColor)),
          'bread': await loadSprite(BREAD_SVG),
          'croissant': await loadSprite(CROISSANT_SVG),
          'donut': await loadSprite(DONUT_SVG),
          'spill': await loadSprite(COFFEE_SPILL_SVG),
          'bird_1': await loadSprite(BIRD_SVG_1),
          'bird_2': await loadSprite(BIRD_SVG_2),
          'coin': await loadSprite(COIN_SVG),
          'gold_coin': await loadSprite(COIN_SVG),
          'espresso': await loadSprite(ESPRESSO_SHOT_SVG),
          'latte': await loadSprite(LATTE_ART_SVG),
          'boss_normal': await loadSprite(BOSS_SVG_NORMAL),
          'boss_angry': await loadSprite(BOSS_SVG_ANGRY),
          'shield': await loadSprite(POWERUP_SHIELD_SVG),
          'magnet': await loadSprite(POWERUP_MAGNET_SVG),
          'projectile_bean': await loadSprite(BEAN_PROJECTILE_SVG),
          'boss_projectile': await loadSprite(BOSS_PROJECTILE_SVG),
        };
        
        if (canvasRef.current && containerRef.current) {
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;
          
          canvasRef.current.width = width;
          canvasRef.current.height = height;
          
          
          const engine = new GatitoEngine(width, height, sprites, config);
          
          engine.onGameOver = (finalScore: number) => {
            setIsGameOver(true);
            setIsPlaying(false);
            if (finalScore > highScore) {
              setHighScore(finalScore);
              localStorage.setItem('gatito_runner_highscore', finalScore.toString());
            }
            const reward = Math.max(1, Math.floor(finalScore / 50));
            setAwardedBeans(reward);
            addBeans(reward);
          };
          engineRef.current = engine;
          setIsLoaded(true);
        }
      } catch (e) {
        console.error("Error loading sprites", e);
      }
    };

    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCatId, isLoaded]);

  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
      if (engineRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          if (!isPausedRef.current) {
             engineRef.current.update();
          }
          engineRef.current.draw(ctx);
          
          // Sync UI state
          if (engineRef.current.state.score !== score) setScore(engineRef.current.state.score);
          if (engineRef.current.state.lives !== lives) setLives(engineRef.current.state.lives);
          if (engineRef.current.state.level !== level) setLevel(engineRef.current.state.level);
          if (engineRef.current.state.bossActive !== bossActive) setBossActive(engineRef.current.state.bossActive);
          if (engineRef.current.state.combo !== combo) setCombo(engineRef.current.state.combo);
          if (engineRef.current.player.ammo !== ammo) setAmmo(engineRef.current.player.ammo);
        }
      }
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    if (isLoaded) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isLoaded, score, lives, isGameOver, highScore, level, bossActive, combo, ammo]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current && engineRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        engineRef.current.state.canvasWidth = width;
        engineRef.current.state.canvasHeight = height;
        engineRef.current.state.groundY = height - 50; 
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        engineRef.current.jump();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        engineRef.current.crouch(true);
      } else if (e.code === 'KeyX') {
        e.preventDefault();
        engineRef.current.shoot();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        setIsPaused(p => !p);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        engineRef.current.crouch(false);
      } else if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        engineRef.current.jumpRelease();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartY.current || !engineRef.current) return;
    
    const touchEndY = e.touches[0].clientY;
    const diffY = touchEndY - touchStartY.current;
    
    // Swipe down
    if (diffY > 30) {
      engineRef.current.crouch(true);
    } 
    // Swipe up
    else if (diffY < -30) {
      engineRef.current.jump();
      touchStartY.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
    if (engineRef.current) {
      engineRef.current.crouch(false);
      engineRef.current.jumpRelease();
    }
  };

  const handleMouseDown = () => {
    if (engineRef.current) {
      engineRef.current.jump();
    }
  };

  const startGame = () => {
    if (engineRef.current) {
      engineRef.current.reset();
      setIsPlaying(true);
      setIsGameOver(false);
      setScore(0);
      setLives(3);
      setLevel(1);
      setCombo(0);
      setAmmo(3);
      setIsPaused(false);
    }
  };

  const renderShop = () => (
    <div className="flex flex-wrap gap-2 justify-center mb-6">
      {GATITO_SKINS.map((cat) => {
        const isUnlocked = unlockedCats.includes(cat.id);
        const isSelected = selectedCatId === cat.id;

        return (
          <div key={cat.id} className={`p-3 rounded-xl border-2 flex flex-col items-center ${isSelected ? 'border-gold bg-stone-800' : 'border-stone-700 bg-stone-900'} w-[130px]`}>
            <div className="w-8 h-8 rounded-full mb-2" style={{ backgroundColor: cat.color }}></div>
            <span className="font-bold text-xs text-center leading-tight mb-1">{cat.name}</span>
            <span className="text-[10px] text-stone-400 text-center mb-2 h-8 leading-tight">{cat.desc}</span>
            {isUnlocked ? (
              <button
                onClick={(e) => { e.stopPropagation(); selectCat(cat.id); }}
                className={`text-xs px-3 py-1.5 rounded-full font-bold w-full transition-colors ${isSelected ? 'bg-gold text-stone-900' : 'bg-stone-700 text-white hover:bg-stone-600'}`}
              >
                {isSelected ? 'Equipado' : 'Equipar'}
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); buyCat(cat.id, cat.price); }}
                className="text-xs px-3 py-1.5 rounded-full font-bold bg-coffee hover:bg-coffee-dark text-white flex items-center justify-center gap-1 w-full transition-colors"
              >
                <Coffee size={12}/> {cat.price}
              </button>
            )}
          </div>
        )
      })}
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-8 px-4 lg:px-8 font-sans text-primary dark:text-stone-100 bg-stone-50 dark:bg-stone-900 flex flex-col">
      <SEOHead 
        title="Gatito Runner | Rose Coffee" 
        description="Juega Gatito Runner, el divertido juego arcade de Rose Coffee. Salta los panes y consigue la mejor puntuación."
      />
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-start">
        <div className="flex justify-between items-center mb-4">
          <Link 
            to="/juegos" 
            className="inline-flex items-center gap-2 text-primary/70 dark:text-stone-400 hover:text-coffee dark:hover:text-gold transition-colors font-semibold text-sm uppercase tracking-wider"
          >
            <ArrowLeft size={16} /> Volver
          </Link>
          <div className="flex items-center gap-2 bg-stone-800 text-gold px-3 py-1.5 rounded-full font-bold shadow-md text-sm border border-stone-700">
            <Coffee size={16} />
            <span>{beans} Granos</span>
          </div>
        </div>
        
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-1 text-primary dark:text-white flex items-center gap-2">
              Gatito Runner 2.0
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
              <span className="hidden md:inline">ESPACIO/ARRIBA saltar, ABAJO agacharse. 'X' Disparar café. 'P' Pausa. </span>
              <span className="md:hidden">Toca izq. para saltar, abajo para agacharte. Toca der. para disparar. </span>
            </p>
          </div>
          
          <div className="text-right flex flex-col items-end">
            <div className="flex items-center gap-1.5 text-gold font-bold mb-1">
              <Crown size={14} /> <span className="text-xs sm:text-sm">High Score: {highScore}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-lg font-bold text-coffee dark:text-gold">Nivel {level}</div>
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart 
                    key={i} 
                    size={20} 
                    className={`${i < lives ? 'fill-red-500 text-red-500' : 'text-stone-300 dark:text-stone-700'}`} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Game Container */}
        <div 
          ref={containerRef}
          className="relative w-full flex-1 min-h-[40vh] max-h-[70vh] bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-stone-800 select-none touch-none focus:outline-none"
          tabIndex={0}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <canvas 
            ref={canvasRef} 
            className="block w-full h-full"
          />

          {/* UI Overlays */}
          <AnimatePresence>
            {isPaused && isPlaying && !isGameOver && (
               <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20"
              >
                 <h2 className="text-4xl font-black text-gold mb-4 uppercase tracking-widest drop-shadow-lg">Pausado</h2>
                 <button 
                    onClick={() => setIsPaused(false)}
                    className="bg-coffee hover:bg-coffee-dark text-white font-bold py-3 px-8 rounded-full border border-white/20 shadow-[0_0_15px_rgba(217,119,6,0.3)] transition-all"
                 >
                    REANUDAR
                 </button>
              </motion.div>
            )}

            {!isPlaying && !isGameOver && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white overflow-y-auto pt-8 pb-4"
              >
                {!isLoaded ? (
                  <div className="animate-pulse font-bold text-xl">Cargando recursos HD...</div>
                ) : (
                  <>
                    <h2 className="text-3xl font-extrabold mb-6 shadow-black drop-shadow-md text-center text-gold">Elige a tu Gatito</h2>
                    
                    {renderShop()}

                    <button 
                      onClick={(e) => { e.stopPropagation(); startGame(); }}
                      className="bg-coffee hover:bg-coffee-dark text-white font-bold py-4 px-10 rounded-2xl flex items-center gap-2 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] border border-white/10"
                    >
                      <Play size={20} fill="currentColor" /> JUGAR AHORA
                    </button>
                  </>
                )}
              </motion.div>
            )}

            {isGameOver && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-stone-900/90 backdrop-blur-md flex flex-col items-center justify-center text-white z-10 overflow-y-auto py-8 px-4"
              >
                <Trophy size={48} className="text-gold mb-4" />
                <h2 className="text-3xl font-extrabold mb-2 text-center text-red-400">¡Juego Terminado!</h2>
                <p className="mb-6 text-stone-600 dark:text-stone-300 text-center">
                  Llegaste al Nivel {level}. <br/>
                  Puntuación final: <span className="font-bold text-coffee dark:text-gold text-2xl">{score}</span>
                  <span className="text-coffee dark:text-gold flex items-center justify-center gap-1 mt-2 font-bold text-lg">
                      <Coffee size={20}/> +{awardedBeans} Granos de Café
                  </span>
                </p>

                {renderShop()}

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {!showLeaderboard ? (
                    <form onSubmit={handleScoreSubmit} className="flex gap-2">
                      <input 
                        type="text"
                        name="playerName"
                        id="playerName"
                        placeholder="Tu nombre (3-15 letras)" 
                        maxLength={15}
                        required
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="px-4 py-3 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                      <button type="submit" className="bg-gold text-stone-900 font-bold px-4 py-3 rounded-xl hover:bg-yellow-500 transition-colors">
                        Guardar
                      </button>
                    </form>
                  ) : (
                    <div className="w-full max-w-xs bg-stone-800/80 rounded-xl p-4 text-sm text-stone-300 h-32 overflow-y-auto">
                      <h3 className="font-bold text-gold mb-2 text-center uppercase">Top 10 Global</h3>
                      {leaderboard.map((entry, idx) => (
                        <div key={entry.id} className="flex justify-between items-center py-1 border-b border-stone-700 last:border-0">
                          <span>{idx + 1}. {entry.player_name}</span>
                          <span className="font-bold text-white">{entry.score}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button 
                    onClick={(e) => { e.stopPropagation(); startGame(); }}
                    className="bg-primary hover:bg-stone-800 border-2 border-stone-600 text-white font-bold py-3 px-8 rounded-2xl flex items-center gap-2 transition-all shadow-xl hover:border-gold group"
                  >
                    <RotateCcw size={18} className="group-hover:-rotate-90 transition-transform duration-300" /> REINTENTAR
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Live Score Overlay */}
          {isPlaying && (
            <div className="absolute top-6 left-6 flex items-center gap-4">
              <div className="text-3xl font-extrabold font-mono text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] pointer-events-none">
                {score.toString().padStart(5, '0')}
              </div>
              
              {combo > 1 && (
                <div className={`font-black text-xl italic drop-shadow-md ${combo >= 10 ? 'text-fuchsia-400 animate-pulse text-2xl' : 'text-gold'} transition-all`}>
                  x{combo > 10 ? 10 : combo} COMBO
                </div>
              )}
              
              <div className="bg-stone-900/80 border border-stone-700 px-3 py-1 rounded-full flex items-center gap-2">
                 <div className="font-bold text-amber-500 text-sm">ESPRESSO</div>
                 <div className="font-mono text-white font-bold">{ammo}</div>
              </div>
              
              {bossActive && (
                <div className="text-red-500 font-extrabold animate-pulse bg-black/50 px-3 py-1 rounded-full drop-shadow-md">
                  ¡JEFE ACTIVO!
                </div>
              )}
            </div>
          )}

          {/* Mobile Controls Overlay */}
          {isPlaying && !isGameOver && (
            <MobileGameController 
              className="absolute bottom-4 left-0 w-full flex justify-between px-6 sm:hidden z-50 pointer-events-none [&_button]:pointer-events-auto"
              dPadConfig={{ up: false, down: true, left: false, right: false }}
              onDown={(active) => { if (engineRef.current) engineRef.current.crouch(active) }}
              actionA={{
                label: 'SALTAR',
                onPress: (active) => { if (engineRef.current) { if(active) engineRef.current.jump(); else engineRef.current.jumpRelease(); } },
                colorClass: 'bg-gold/80 active:bg-gold border-yellow-400 text-amber-950 font-black'
              }}
              actionB={{
                icon: <Coffee className="w-8 h-8 text-white" />,
                onPress: (active) => { if (engineRef.current && active) engineRef.current.shoot() },
                colorClass: 'bg-coffee-dark/80 active:bg-coffee-dark border-coffee'
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GatitoRunner;
