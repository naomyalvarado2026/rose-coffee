import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface GameWalletState {
  beans: number;
  totalBeans: number;
  addBeans: (amount: number) => void;
  spendBeans: (amount: number) => boolean;
  setBeansDirectly: (newBeans: number, newTotalBeans: number) => void;
}

const GameWalletContext = createContext<GameWalletState | null>(null);

export const GameWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [beans, setBeans] = useState<number>(0);
  const [totalBeans, setTotalBeans] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initially
  useEffect(() => {
    const walletSave = localStorage.getItem('rose_coffee_wallet');
    if (walletSave) {
      try {
        const parsed = JSON.parse(walletSave);
        setBeans(parsed.beans || 0);
        setTotalBeans(parsed.totalBeans || 0);
      } catch (e) {
        console.error("Error loading wallet", e);
      }
    } else {
      // Migrate from clicker if exists (first time playing since this update)
      const clickerSave = localStorage.getItem('coffee_clicker_save');
      if (clickerSave) {
        try {
          const parsed = JSON.parse(clickerSave);
          setBeans(parsed.beans || 0);
          setTotalBeans(parsed.totalBeans || 0);
        } catch (e) {}
      }
    }
    setIsLoaded(true);
  }, []);

  // Save on change
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('rose_coffee_wallet', JSON.stringify({ beans, totalBeans }));
  }, [beans, totalBeans, isLoaded]);

  const addBeans = useCallback((amount: number) => {
    setBeans(b => b + amount);
    setTotalBeans(tb => tb + amount);
  }, []);

  const spendBeans = useCallback((amount: number) => {
    let success = false;
    setBeans(b => {
      if (b >= amount) {
        success = true;
        return b - amount;
      }
      return b;
    });
    return success;
  }, []);

  const setBeansDirectly = useCallback((newBeans: number, newTotal: number) => {
    setBeans(newBeans);
    setTotalBeans(newTotal);
  }, []);

  return (
    <GameWalletContext.Provider value={{ beans, totalBeans, addBeans, spendBeans, setBeansDirectly }}>
      {children}
    </GameWalletContext.Provider>
  );
};

export const useGameWallet = () => {
  const context = useContext(GameWalletContext);
  if (!context) {
    throw new Error("useGameWallet must be used within a GameWalletProvider");
  }
  return context;
};
