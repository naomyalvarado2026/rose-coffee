import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Coffee, Users, Zap, Building2, Activity, Star, Globe, Rocket, Briefcase, Zap as Bolt } from 'lucide-react';
import SEOHead from '../../../components/common/SEOHead';
import { audio } from '../../../utils/audioEngine';
import { useGameWallet } from '../../../contexts/GameWalletContext';
import Confetti from '../../../components/games/common/Confetti';

// Define the Upgrades available in the shop
const UPGRADES = [
  { id: 'molino', name: 'Nuevo Molino', description: '+1 Grano / Clic', baseCost: 50, cps: 0, clickPower: 1, icon: Zap, color: 'text-yellow-500' },
  { id: 'barista_jr', name: 'Barista Junior', description: '+5 Granos / Segundo', baseCost: 100, cps: 5, clickPower: 0, icon: Users, color: 'text-blue-500' },
  { id: 'espresso', name: 'Máquina Espresso', description: '+30 Granos / Segundo', baseCost: 450, cps: 30, clickPower: 0, icon: Coffee, color: 'text-coffee dark:text-gold' },
  { id: 'bakery', name: 'Horno Masa Madre', description: '+200 Granos / Segundo', baseCost: 2000, cps: 200, clickPower: 0, icon: Building2, color: 'text-orange-500' },
  { id: 'specialty', name: 'Cafetería Especialidad', description: '+1,500 Granos / Segundo', baseCost: 15000, cps: 1500, clickPower: 0, icon: Star, color: 'text-purple-500' },
  { id: 'franchise', name: 'Franquicia Global', description: '+15,000 Granos / Segundo', baseCost: 150000, cps: 15000, clickPower: 0, icon: Globe, color: 'text-emerald-500' },
  { id: 'empire', name: 'Imperio Intergaláctico', description: '+250,000 Granos / Segundo', baseCost: 2000000, cps: 250000, clickPower: 0, icon: Rocket, color: 'text-rose-500' },
];

const MILESTONES = [
  { threshold: 10000, label: 'Cafetero Novato', color: 'text-stone-600 dark:text-stone-400', glow: 'shadow-[0_0_60px_rgba(62,39,35,0.1)]' },
  { threshold: 100000, label: 'Barista Profesional', color: 'text-blue-500', glow: 'shadow-[0_0_60px_rgba(59,130,246,0.3)]' },
  { threshold: 1000000, label: 'Maestro Tostador', color: 'text-purple-500', glow: 'shadow-[0_0_80px_rgba(168,85,247,0.4)]' },
  { threshold: 10000000, label: 'Magnate del Café', color: 'text-gold', glow: 'shadow-[0_0_100px_rgba(212,175,55,0.6)]' },
  { threshold: 100000000, label: 'Deidad Cafetera', color: 'text-rose-500', glow: 'shadow-[0_0_120px_rgba(244,63,94,0.8)]' },
];

interface SaveState {
  beans: number;
  totalBeans: number;
  clickPower: number;
  cps: number;
  inventory: Record<string, number>;
  lastPlayed: number;
}

const DEFAULT_STATE: SaveState = {
  beans: 0,
  totalBeans: 0,
  clickPower: 1,
  cps: 0,
  inventory: {
    'molino': 0,
    'barista_jr': 0,
    'espresso': 0,
    'bakery': 0,
    'specialty': 0,
    'franchise': 0,
    'empire': 0
  },
  lastPlayed: Date.now()
};

interface ClickParticle {
  id: number;
  x: number;
  y: number;
  amount: number;
  isCrit: boolean;
}

const CoffeeClicker: React.FC = () => {
  const { beans: globalBeans, totalBeans: globalTotalBeans, setBeansDirectly } = useGameWallet();
  const [gameState, setGameState] = useState<SaveState>(() => {
    const saved = localStorage.getItem('coffee_clicker_save');
    if (saved) {
      try {
        const parsed: SaveState = JSON.parse(saved);
        if (parsed.lastPlayed && parsed.cps > 0) {
          const secondsOffline = Math.floor((Date.now() - parsed.lastPlayed) / 1000);
          if (secondsOffline > 60) {
            const offlineGains = Math.min(secondsOffline * parsed.cps, 3600 * parsed.cps);
            parsed.beans += offlineGains;
            parsed.totalBeans += offlineGains;
          }
        }
        if (globalTotalBeans > parsed.totalBeans) {
           parsed.beans = globalBeans;
           parsed.totalBeans = globalTotalBeans;
        }
        return { ...DEFAULT_STATE, ...parsed, lastPlayed: Date.now() };
      } catch (e) {
        console.error("Error loading save", e);
      }
    }
    return DEFAULT_STATE;
  });
  
  const [particles, setParticles] = useState<ClickParticle[]>([]);
  const particleIdCounter = useRef(0);
  const containerRef = useRef<HTMLButtonElement>(null);
  const [combo, setCombo] = useState(0);
  const lastClickTime = useRef(0);
  const [frenzyTimeLeft, setFrenzyTimeLeft] = useState(0);
  const frenzyMultiplier = frenzyTimeLeft > 0 ? 5 : 1;
  const [rushTimeLeft, setRushTimeLeft] = useState(0);
  const [activeEvent, setActiveEvent] = useState<{type: 'golden'|'angel'|'rush', x: number, y: number} | null>(null);
  
  const [currentMilestone, setCurrentMilestone] = useState(-1);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    let newMilestone = -1;
    for (let i = MILESTONES.length - 1; i >= 0; i--) {
      if (gameState.totalBeans >= MILESTONES[i].threshold) {
        newMilestone = i;
        break;
      }
    }
    
    if (newMilestone > currentMilestone) {
      if (currentMilestone !== -1) {
        setShowConfetti(true);
        audio.playPowerUp();
        setTimeout(() => setShowConfetti(false), 5000);
      }
      setCurrentMilestone(newMilestone);
    }
  }, [gameState.totalBeans, currentMilestone]);

  useEffect(() => {
    if (frenzyTimeLeft > 0) {
      const timer = setInterval(() => setFrenzyTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [frenzyTimeLeft]);

  useEffect(() => {
    if (rushTimeLeft > 0) {
      const timer = setInterval(() => setRushTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [rushTimeLeft]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastClickTime.current > 1500 && combo > 0) {
        setCombo(0);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [combo]);

  useEffect(() => {
    const spawner = setInterval(() => {
      if (!activeEvent && frenzyTimeLeft === 0 && rushTimeLeft === 0 && Math.random() < 0.15) {
        const rand = Math.random();
        let type: 'golden'|'angel'|'rush' = 'golden';
        if (rand < 0.3) type = 'angel';
        else if (rand < 0.6) type = 'rush';

        setActiveEvent({
          type,
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 80
        });
        setTimeout(() => setActiveEvent(prev => prev ? null : prev), 5000);
      }
    }, 10000);
    return () => clearInterval(spawner);
  }, [activeEvent, frenzyTimeLeft, rushTimeLeft]);

  const handleEventClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeEvent) return;
    audio.playPowerUp();
    if (activeEvent.type === 'golden') {
      setFrenzyTimeLeft(10);
    } else if (activeEvent.type === 'rush') {
      setRushTimeLeft(20);
    } else if (activeEvent.type === 'angel') {
      const bonus = (gameState.cps || 10) * 300;
      setGameState(prev => ({
        ...prev,
        beans: prev.beans + bonus,
        totalBeans: prev.totalBeans + bonus
      }));
      setParticles(prev => [...prev, {
        id: particleIdCounter.current++,
        x: 150, y: 150, amount: bonus, isCrit: true
      }]);
    }
    setActiveEvent(null);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem('coffee_clicker_save', JSON.stringify(gameState));
      setBeansDirectly(gameState.beans, gameState.totalBeans);
    }, 5000);
    return () => clearInterval(timer);
  }, [gameState, setBeansDirectly]);

  useEffect(() => {
    if (gameState.cps === 0) return;
    const tickRate = rushTimeLeft > 0 ? 500 : 1000;
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        beans: prev.beans + (prev.cps * frenzyMultiplier),
        totalBeans: prev.totalBeans + (prev.cps * frenzyMultiplier)
      }));
    }, tickRate);
    return () => clearInterval(interval);
  }, [gameState.cps, frenzyMultiplier, rushTimeLeft]);

  const handleMainClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = Date.now();
    let currentCombo = combo;
    if (now - lastClickTime.current < 1500) {
      currentCombo = Math.min(combo + 1, 4);
      setCombo(currentCombo);
    } else {
      currentCombo = 0;
      setCombo(0);
    }
    lastClickTime.current = now;
    const effectiveClickPower = Math.max(gameState.clickPower, Math.floor(gameState.cps * 0.05));
    const comboMultiplier = 1 + currentCombo;
    const clickAmount = effectiveClickPower * frenzyMultiplier * comboMultiplier;
    const newParticle: ClickParticle = {
      id: particleIdCounter.current++,
      x,
      y,
      amount: clickAmount,
      isCrit: currentCombo >= 3
    };
    setParticles(prev => [...prev, newParticle]);
    audio.playJump();
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 1000);
    setGameState(prev => ({
      ...prev,
      beans: prev.beans + clickAmount,
      totalBeans: prev.totalBeans + clickAmount
    }));
  };

  const getCost = (upgradeId: string) => {
    const upgrade = UPGRADES.find(u => u.id === upgradeId)!;
    const count = gameState.inventory[upgradeId] || 0;
    return Math.floor(upgrade.baseCost * Math.pow(1.15, count));
  };

  const buyUpgrade = (upgradeId: string) => {
    const cost = getCost(upgradeId);
    if (gameState.beans >= cost) {
      const upgrade = UPGRADES.find(u => u.id === upgradeId)!;
      setGameState(prev => ({
        ...prev,
        beans: prev.beans - cost,
        clickPower: prev.clickPower + upgrade.clickPower,
        cps: prev.cps + upgrade.cps,
        inventory: {
          ...prev.inventory,
          [upgradeId]: (prev.inventory[upgradeId] || 0) + 1
        }
      }));
      audio.playCoin();
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 md:pt-32 md:pb-16 px-4 lg:px-24 font-sans text-primary dark:text-stone-100 bg-stone-50 dark:bg-stone-900 relative">
      <SEOHead title="Coffee Clicker | Rose Coffee" description="Construye tu imperio cafetero desde cero." />
      <Confetti active={showConfetti} />
      <div className="max-w-6xl mx-auto md:h-[calc(100vh-200px)] flex flex-col relative z-10">
        <Link to="/juegos" className="inline-flex items-center gap-2 text-primary/70 dark:text-stone-400 hover:text-coffee dark:hover:text-gold mb-3 md:mb-6 transition-colors font-semibold text-sm uppercase tracking-wider shrink-0">
          <ArrowLeft size={16} /> Volver a Mini Juegos
        </Link>
        <div className="flex-1 flex flex-col md:flex-row gap-0 md:gap-8 bg-white dark:bg-stone-800 rounded-2xl md:rounded-3xl shadow-xl border border-stone-200 dark:border-stone-700 md:overflow-hidden">
          <div className="w-full min-h-[400px] py-12 shrink-0 md:h-auto md:shrink-1 md:flex-1 p-4 md:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-stone-200 dark:border-stone-700 relative bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-800 overflow-hidden">
            <div className="absolute left-8 top-8 bottom-8 w-4 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden hidden md:block">
              <div className="absolute bottom-0 left-0 right-0 bg-coffee dark:bg-gold transition-all duration-300 ease-out rounded-full" style={{ height: `${(combo / 4) * 100}%` }}>
                {combo > 0 && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
              </div>
            </div>
            <div className="absolute top-4 md:top-8 text-center w-full z-10">
              <h2 className="text-sm md:text-xl font-extrabold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-1 md:mb-2">Granos de Café</h2>
              <div className="text-4xl md:text-6xl font-black text-coffee dark:text-gold mb-1 drop-shadow-sm">{Math.floor(gameState.beans).toLocaleString()}</div>
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-stone-500 dark:text-stone-400 bg-stone-200/50 dark:bg-stone-800/50 py-1.5 px-4 rounded-full w-max mx-auto shadow-inner">
                <Activity size={14} className={`animate-pulse ${rushTimeLeft > 0 ? 'text-rose-500' : 'text-green-500'}`} />
                {(gameState.cps * frenzyMultiplier).toLocaleString()} granos / seg
              </div>
              <AnimatePresence>
                {frenzyMultiplier > 1 && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-gold font-black uppercase tracking-widest animate-pulse">¡Frenesí x{frenzyMultiplier}! ({frenzyTimeLeft}s)</motion.div>}
                {rushTimeLeft > 0 && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-rose-500 font-black uppercase tracking-widest animate-pulse">¡Rush de Cafeína! ({rushTimeLeft}s)</motion.div>}
                {combo > 0 && <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="mt-2 text-orange-500 dark:text-orange-400 font-black text-lg tracking-widest">COMBO x{combo + 1}</motion.div>}
              </AnimatePresence>
            </div>
            <button ref={containerRef} className="relative focus:outline-none select-none touch-none mt-16 md:mt-16 group" onClick={handleMainClick}>
              <motion.div whileTap={{ scale: 0.95 }} className={`relative z-10 w-32 h-32 md:w-64 md:h-64 rounded-full flex items-center justify-center overflow-hidden border-4 transition-all duration-300 ${combo === 4 ? 'bg-orange-500/20 border-orange-500/50 shadow-[0_0_80px_rgba(249,115,22,0.4)] animate-pulse' : `bg-coffee/5 border-coffee/10 dark:border-gold/10 ${currentMilestone >= 0 ? MILESTONES[currentMilestone].glow : 'shadow-[0_0_60px_rgba(62,39,35,0.1)]'}`}`}>
                <motion.svg animate={frenzyMultiplier > 1 || combo === 4 ? { scale: [1, 1.1, 1] } : {}} transition={{ repeat: Infinity, duration: 0.5 }} viewBox="0 0 100 100" className={`w-3/4 h-3/4 drop-shadow-xl transition-colors duration-300 ${frenzyMultiplier > 1 ? 'text-gold' : combo === 4 ? 'text-orange-500' : (currentMilestone >= 0 ? MILESTONES[currentMilestone].color : 'text-coffee dark:text-gold')}`} fill="currentColor">
                  <path d="M 50 10 C 20 10 10 30 10 50 C 10 80 40 90 50 90 C 80 90 90 70 90 50 C 90 20 60 10 50 10 Z" />
                  <path d="M 30 20 Q 60 40 40 80" stroke="#fff" strokeWidth="4" fill="none" className="opacity-20" />
                  <path d="M 35 20 Q 65 40 45 80" stroke="#fff" strokeWidth="2" fill="none" className="opacity-10" />
                </motion.svg>
              </motion.div>
              <AnimatePresence>
                {currentMilestone >= 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`absolute -bottom-8 left-0 right-0 text-center font-bold text-sm tracking-wider uppercase transition-colors ${MILESTONES[currentMilestone].color}`}>
                    {MILESTONES[currentMilestone].label}
                  </motion.div>
                )}
                {activeEvent && (
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, opacity: 0 }} onClick={handleEventClick} className={`absolute z-30 cursor-pointer ${activeEvent.type === 'angel' ? 'animate-pulse' : 'animate-bounce'}`} style={{ left: `${activeEvent.x}%`, top: `${activeEvent.y}%` }}>
                    {activeEvent.type === 'golden' && <svg viewBox="0 0 100 100" className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" fill="currentColor"><path d="M 50 10 C 20 10 10 30 10 50 C 10 80 40 90 50 90 C 80 90 90 70 90 50 C 90 20 60 10 50 10 Z" /></svg>}
                    {activeEvent.type === 'angel' && <div className="bg-white rounded-full p-2 shadow-[0_0_20px_rgba(59,130,246,0.8)]"><Briefcase className="w-12 h-12 text-blue-500" /></div>}
                    {activeEvent.type === 'rush' && <div className="bg-stone-900 rounded-full p-2 shadow-[0_0_20px_rgba(244,63,94,0.8)]"><Bolt className="w-12 h-12 text-rose-500" /></div>}
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {particles.map(p => (
                  <motion.div key={p.id} initial={{ opacity: 1, y: 0, scale: p.isCrit ? 1 : 0.5 }} animate={{ opacity: 0, y: -100, scale: p.isCrit ? 2 : 1.5 }} exit={{ opacity: 0 }} transition={{ duration: p.isCrit ? 1.5 : 1, ease: "easeOut" }} className={`absolute pointer-events-none font-black drop-shadow-md z-20 select-none ${p.isCrit ? 'text-4xl text-orange-500 dark:text-orange-400' : 'text-2xl text-coffee dark:text-gold'}`} style={{ left: p.x - 10, top: p.y - 10 }}>+{p.amount.toLocaleString()}</motion.div>
                ))}
              </AnimatePresence>
            </button>
          </div>
          <div className="w-full md:w-[450px] flex flex-col h-[500px] md:h-full md:max-h-full">
            <div className="p-4 md:p-6 border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shrink-0 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">Tienda</h2>
                <p className="text-sm text-stone-500 dark:text-stone-400">Automatiza tu imperio.</p>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase text-stone-400 font-bold tracking-wider mb-1">Sinergia Clic</div>
                <div className="text-sm font-black text-coffee dark:text-gold flex items-center justify-end gap-1"><Activity size={12}/> 5% CPS</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {UPGRADES.map(upgrade => {
                const cost = getCost(upgrade.id);
                const count = gameState.inventory[upgrade.id] || 0;
                const canAfford = gameState.beans >= cost;
                return (
                  <button key={upgrade.id} onClick={() => buyUpgrade(upgrade.id)} disabled={!canAfford} className={`w-full text-left p-3 rounded-2xl border-2 transition-all flex items-center gap-3 group ${canAfford ? 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-coffee dark:hover:border-gold hover:shadow-md cursor-pointer' : 'bg-stone-100 dark:bg-stone-900/50 border-stone-100 dark:border-stone-900 opacity-60 cursor-not-allowed'}`}>
                    <div className={`p-3 rounded-xl bg-stone-100 dark:bg-stone-900 ${upgrade.color}`}><upgrade.icon size={20} /></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-0.5"><h3 className="font-bold text-base leading-tight">{upgrade.name}</h3><span className="text-xl font-black text-stone-300 dark:text-stone-600">{count}</span></div>
                      <div className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1.5">{upgrade.description}</div>
                      <div className={`text-sm font-bold flex items-center gap-1 ${canAfford ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}><Coffee size={12} className={canAfford ? 'fill-current' : ''} /> {cost.toLocaleString()}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="p-3 bg-stone-100 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 shrink-0 text-[10px] font-mono text-stone-500 dark:text-stone-400 text-center uppercase tracking-widest flex justify-between px-6">
              <span>Poder Base: {gameState.clickPower}</span>
              <span>Granos Totales: {Math.floor(gameState.totalBeans).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoffeeClicker;
