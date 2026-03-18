import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PetState {
  name: string;
  hunger: number;
  happiness: number;
  energy: number;
  lastUpdate: number;
  bornAt: number;
  stage: 'egg' | 'hatchling' | 'child' | 'adult';
  isSleeping: boolean;
  isDead: boolean;
  isExamining: boolean;
  isWalking: boolean;
  isRoaming: boolean;
  stayPosition: { x: number, y: number } | null;
  customSprite?: string; // 1024 chars of '0'-'9' (0 = transparent/bg)
  palette: string[]; // 4 slots for custom colors
}

const DEFAULT_PET_STATE: PetState = {
  name: 'petpet',
  hunger: 80,
  happiness: 80,
  energy: 100,
  lastUpdate: Date.now(),
  bornAt: Date.now(),
  stage: 'egg',
  isSleeping: false,
  isDead: false,
  isExamining: true,
  isWalking: false,
  isRoaming: false,
  stayPosition: null,
  palette: ['#ffffff', '#ff0000', '#00ff00', '#0000ff'], // Default 4 slots
};

interface SystemContextType {
  pinnedApps: string[];
  pinApp: (appId: string) => void;
  unpinApp: (appId: string) => void;
  isPinned: (appId: string) => boolean;
  // Pet State
  pet: PetState;
  setPet: React.Dispatch<React.SetStateAction<PetState>>;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pinnedApps, setPinnedApps] = useState<string[]>(() => {
    const saved = localStorage.getItem('sknii-pinned-apps');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [pet, setPet] = useState<PetState>(() => {
    const saved = localStorage.getItem('skniigachi-data');
    if (saved) {
      try {
        return { ...DEFAULT_PET_STATE, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_PET_STATE;
      }
    }
    return DEFAULT_PET_STATE;
  });

  useEffect(() => {
    localStorage.setItem('sknii-pinned-apps', JSON.stringify(pinnedApps));
  }, [pinnedApps]);

  useEffect(() => {
    localStorage.setItem('skniigachi-data', JSON.stringify(pet));
  }, [pet]);

  const pinApp = (appId: string) => {
    if (!pinnedApps.includes(appId)) {
      setPinnedApps(prev => [...prev, appId]);
    }
  };

  const unpinApp = (appId: string) => {
    setPinnedApps(prev => prev.filter(id => id !== appId));
  };

  const isPinned = (appId: string) => pinnedApps.includes(appId);

  return (
    <SystemContext.Provider value={{ pinnedApps, pinApp, unpinApp, isPinned, pet, setPet }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) throw new Error('useSystem must be used within a SystemProvider');
  return context;
};
