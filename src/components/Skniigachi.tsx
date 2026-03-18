import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Utensils, Zap, Footprints, Edit3, Save, Palette, Terminal, RefreshCw, Search, Home as HomeIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSystem } from '../context/SystemContext';
import { PixelEditor } from './PixelEditor';
import { PetSprite } from './PetSprite';

export const Skniigachi: React.FC = () => {
  const { theme } = useTheme();
  const { pet, setPet } = useSystem();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(pet.name);
  const [isDesigning, setIsDesigning] = useState(false);
  const [isNaming, setIsNaming] = useState(false);

  // Vitals decay logic (Global state)
  useEffect(() => {
    const interval = setInterval(() => {
      if (pet.isDead) return;

      if (pet.isSleeping) {
        setPet(prev => ({
          ...prev,
          energy: Math.min(100, prev.energy + 5),
          hunger: Math.max(0, prev.hunger - 1),
          lastUpdate: Date.now()
        }));
      } else {
        setPet(prev => {
          const newHunger = Math.max(0, prev.hunger - 2);
          const newEnergy = Math.max(0, prev.energy - 1);
          const isDead = (newHunger === 0 || newEnergy === 0) && prev.stage !== 'egg';
          
          return {
            ...prev,
            hunger: newHunger,
            happiness: Math.max(0, prev.happiness - 1),
            energy: newEnergy,
            isDead: isDead,
            lastUpdate: Date.now()
          };
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [pet.isSleeping, pet.isDead, pet.stage, setPet]);

  const feed = () => {
    if (pet.isDead || pet.isSleeping || pet.isWalking || isDesigning || isNaming) return;
    setPet(prev => ({
      ...prev,
      hunger: Math.min(100, prev.hunger + 20),
      happiness: Math.min(100, prev.happiness + 5)
    }));
  };

  const play = () => {
    if (pet.isDead || pet.isSleeping || pet.isWalking || isDesigning || isNaming || pet.energy < 10) return;
    setPet(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 25),
      energy: Math.max(0, prev.energy - 15)
    }));
  };

  const toggleSleep = () => {
    if (pet.isDead || pet.isWalking || isDesigning || isNaming) return;
    setPet(prev => ({ ...prev, isSleeping: !prev.isSleeping }));
  };

  const toggleExamine = () => {
    if (pet.isDead || pet.isWalking || isDesigning || isNaming) return;
    setPet(prev => ({ ...prev, isExamining: !prev.isExamining }));
  };

  const resurrect = () => {
    setPet(prev => ({
      ...prev,
      isDead: false,
      hunger: 50,
      happiness: 50,
      energy: 50,
      stage: 'hatchling',
      isSleeping: false,
      bornAt: Date.now()
    }));
  };

  const hatch = () => {
    if (pet.stage === 'egg' && !isDesigning) {
      setPet(prev => ({ ...prev, stage: 'hatchling', bornAt: Date.now() }));
      setIsNaming(true);
    }
  };

  const formatAge = () => {
    if (pet.stage === 'egg') return '0s';
    const seconds = Math.floor((Date.now() - pet.bornAt) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const toggleWalk = () => {
    if (pet.isDead) return;
    setPet(prev => ({ ...prev, isWalking: !prev.isWalking }));
  };

  const handleNameSave = () => {
    setPet(prev => ({ ...prev, name: newName || 'petpet' }));
    setIsEditingName(false);
    setIsNaming(false);
  };

  const getMood = (): any => {
    if (pet.isDead) return 'dead';
    if (pet.isSleeping) return 'sleeping';
    if (pet.hunger < 20) return 'hungry';
    if (pet.happiness > 80) return 'happy';
    if (pet.happiness < 30) return 'sad';
    return 'idle';
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 select-none min-h-0 h-full">
      <div 
        className="w-[450px] min-h-[550px] h-fit win95-outset surface-grit rounded-[40px] p-6 flex flex-col gap-4 relative shadow-2xl shrink-0"
        style={{ backgroundColor: theme.surface }}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
        <div className="absolute top-0 left-0 w-1 h-full bg-white/20" />

        <div 
          className="flex-1 win95-inset bg-[#8b956d] p-3 rounded-lg flex flex-col relative overflow-hidden min-h-[400px]"
          style={{ 
            backgroundImage: 'url(/assets/images/skniigachi/blank_bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            imageRendering: 'pixelated'
          }}
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '4px 4px' }} />
          
          <div className="flex justify-between items-start z-10 opacity-70">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1">
                <Utensils className="w-2.5 h-2.5" />
                <div className="w-8 h-1 bg-black/20 overflow-hidden">
                  <div className="h-full bg-black/60" style={{ width: `${pet.hunger}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-2.5 h-2.5" />
                <div className="w-8 h-1 bg-black/20 overflow-hidden">
                  <div className="h-full bg-black/60" style={{ width: `${pet.happiness}%` }} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-8 h-1 bg-black/20 overflow-hidden">
                <div className="h-full bg-black/60" style={{ width: `${pet.energy}%` }} />
              </div>
              <Zap className="w-2.5 h-2.5" />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative z-10 overflow-hidden">
            <AnimatePresence mode="wait">
              {isDesigning ? (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full h-full overflow-y-auto custom-scrollbar p-2"
                >
                  <PixelEditor onSave={() => setIsDesigning(false)} />
                </motion.div>
              ) : isNaming ? (
                <motion.div
                  key="naming"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 text-center p-4 win95-outset bg-black/20"
                >
                  <Terminal className="w-8 h-8 opacity-50" />
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase">IDENTIFY YOUR CREATURE</p>
                    <input 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="petpet"
                      className="bg-black/40 win95-inset px-2 py-1 text-xs text-center w-32 focus:outline-none"
                      autoFocus
                    />
                  </div>
                  <button 
                    onClick={handleNameSave}
                    className="px-4 py-1 win95-outset bg-black/20 text-[10px] font-bold uppercase active:win95-inset"
                  >
                    Confirm
                  </button>
                </motion.div>
              ) : pet.isWalking ? (
                <motion.div
                  key="walking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <Footprints className="w-8 h-8 opacity-20 animate-bounce" />
                  <span className="text-[10px] font-bold uppercase opacity-40 leading-tight">
                    {pet.name} IS<br/>OUT ON A WALK
                  </span>
                  <button 
                    onClick={toggleWalk}
                    className="mt-2 px-3 py-1 win95-outset bg-black/20 text-[8px] font-bold uppercase active:win95-inset"
                  >
                    Call Back
                  </button>
                </motion.div>
              ) : pet.stage === 'egg' ? (
                <motion.div
                  key="egg"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [0.8, 1, 0.8], rotate: [-2, 2, -2] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  onClick={hatch}
                  className="cursor-pointer"
                >
                  <div 
                    className="w-16 h-20 bg-black/80 rounded-full border-4 border-black/40 relative"
                    style={{ clipPath: 'ellipse(45% 50% at 50% 50%)' }}
                  >
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full" />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="pet"
                  animate={
                    pet.isDead 
                      ? { y: [0, -2, 0], opacity: 0.6 } 
                      : pet.isExamining 
                        ? (pet.isSleeping ? { y: [0, 2, 0] } : { y: [0, -5, 0], x: [-2, 2, -2] })
                        : { 
                            x: [-60, 60, -60],
                            y: [120, 80, 120, 80, 120], 
                            scaleX: [1, -1, 1]
                          }
                  }
                  transition={
                    pet.isDead 
                      ? { repeat: Infinity, duration: 3 }
                      : pet.isExamining
                        ? { repeat: Infinity, duration: pet.isSleeping ? 4 : 2 }
                        : { 
                            x: { repeat: Infinity, duration: 12, ease: "linear" },
                            y: { repeat: Infinity, duration: 1.5, ease: "easeOut" },
                            scaleX: { repeat: Infinity, duration: 12, ease: (t: number) => t < 0.5 ? 0 : 1 }
                          }
                  }
                  className={`relative flex flex-col items-center justify-center gap-4 ${!pet.isExamining ? 'absolute bottom-8' : ''}`}
                >
                  <PetSprite 
                    data={pet.customSprite} 
                    size={pet.isExamining ? 160 : 64} 
                    palette={pet.palette} 
                    fallbackColor="#d1d5db" 
                    mood={getMood()} 
                  />
                  {pet.isDead && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={resurrect}
                      className="px-4 py-2 win95-outset bg-black/40 text-white flex items-center gap-2 font-bold uppercase text-xs hover:bg-black/60 active:win95-inset"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Resurrect
                    </motion.button>
                  )}
                  {pet.isSleeping && (
                    <motion.span 
                      animate={{ y: [-10, -30], x: [10, 20], opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute top-0 right-0 font-bold text-black"
                    >
                      Zzz
                    </motion.span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="text-center z-10 h-6">
            {!isDesigning && !isNaming && (
              isEditingName ? (
                <div className="flex items-center gap-1 justify-center">
                  <input 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-transparent border-b border-black/40 text-[10px] w-20 text-center focus:outline-none font-bold uppercase"
                    autoFocus
                  />
                  <button onClick={handleNameSave}><Save className="w-3 h-3" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-1 justify-center group cursor-pointer" onClick={() => setIsEditingName(true)}>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{pet.name}</span>
                  <Edit3 className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )
            )}
          </div>
        </div>

        <div className="flex justify-between items-center px-2">
          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={feed}
              disabled={pet.stage === 'egg' || pet.isSleeping || pet.isWalking || isDesigning || isNaming}
              className="w-10 h-10 rounded-full win95-outset bg-red-800 flex items-center justify-center active:win95-inset disabled:opacity-50 disabled:grayscale"
            >
              <Utensils className="w-5 h-5 text-white/80" />
            </button>
            <span className="text-[10px] font-bold uppercase opacity-60">Feed</span>
          </div>

          <div className="flex flex-col items-center gap-1 pt-4">
            <button 
              onClick={toggleSleep}
              disabled={pet.stage === 'egg' || pet.isWalking || isDesigning || isNaming}
              className="w-10 h-10 rounded-full win95-outset bg-blue-800 flex items-center justify-center active:win95-inset disabled:opacity-50 disabled:grayscale"
            >
              <Zap className="w-5 h-5 text-white/80" />
            </button>
            <span className="text-[10px] font-bold uppercase opacity-60">Sleep</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={play}
              disabled={pet.stage === 'egg' || pet.isSleeping || pet.isWalking || isDesigning || isNaming}
              className="w-10 h-10 rounded-full win95-outset bg-green-800 flex items-center justify-center active:win95-inset disabled:opacity-50 disabled:grayscale"
            >
              <Heart className="w-5 h-5 text-white/80" />
            </button>
            <span className="text-[10px] font-bold uppercase opacity-60">Play</span>
          </div>
        </div>

        {!pet.isWalking && !isDesigning && !isNaming && (
          <>
            <button
              onClick={toggleWalk}
              disabled={pet.stage === 'egg' || pet.isSleeping}
              className="absolute -bottom-2 right-6 px-4 py-1 win95-outset surface-grit text-[10px] font-bold uppercase flex items-center gap-1 transition-transform hover:-translate-y-1 text-gray-400 disabled:opacity-50"
            >
              <Footprints className="w-3 h-3" />
              Go Walk
            </button>

            <button
              onClick={toggleExamine}
              disabled={pet.stage === 'egg'}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 win95-outset surface-grit text-[10px] font-bold uppercase flex items-center gap-1 transition-transform hover:-translate-y-1 text-gray-400 disabled:opacity-50"
            >
              {pet.isExamining ? <HomeIcon className="w-3 h-3" /> : <Search className="w-3 h-3" />}
              {pet.isExamining ? 'Home' : 'Examine'}
            </button>

            <button
              onClick={() => setIsDesigning(true)}
              className="absolute -bottom-2 left-6 px-4 py-1 win95-outset surface-grit text-[10px] font-bold uppercase flex items-center gap-1 transition-transform hover:-translate-y-1 text-gray-400"
            >
              <Palette className="w-3 h-3" />
              Design
            </button>
          </>
        )}
      </div>

      <div className="win95-inset bg-black/20 p-3 w-[450px] text-[11px] font-mono opacity-60 space-y-1">
        <div className="flex justify-between items-center">
          <div className="space-x-4">
            <span>STAGE: {pet.stage.toUpperCase()}</span>
            <span>AGE: {formatAge()}</span>
          </div>
          <span>STATUS: {pet.isSleeping ? 'SLEEPING' : 'ACTIVE'} {isDesigning ? '| EDITING' : ''}</span>
        </div>
        <p>LAST_SYNC: {new Date(pet.lastUpdate).toLocaleTimeString()}</p>
      </div>
    </div>
  );
};
