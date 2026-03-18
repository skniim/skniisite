import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../context/SystemContext';
import { PetSprite } from './PetSprite';
import { Home, Compass, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const vx = e.clientX - lastPos.current.x;
      const vy = e.clientY - lastPos.current.y;
      setVelocity({ x: vx, y: vy });
      setMousePosition({ x: e.clientX, y: e.clientY });
      lastPos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  return { ...mousePosition, vx: velocity.x, vy: velocity.y };
};

interface PetContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onSendHome: () => void;
  isRoaming: boolean;
  onToggleRoam: () => void;
}

const PetContextMenu: React.FC<PetContextMenuProps> = ({ x, y, onClose, onSendHome, isRoaming, onToggleRoam }) => {
  const { theme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={menuRef}
      className="fixed z-[200] w-48 win95-outset surface-grit p-1 shadow-2xl"
      style={{ left: x, top: y }}
    >
      <button
        onClick={() => { onToggleRoam(); onClose(); }}
        className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider"
        style={{ color: theme.primary }}
      >
        {isRoaming ? <User className="w-3 h-3" /> : <Compass className="w-3 h-3" />}
        {isRoaming ? 'Take for Walk' : 'Let Roam'}
      </button>
      <button
        onClick={() => { onSendHome(); onClose(); }}
        className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider"
        style={{ color: theme.secondary }}
      >
        <Home className="w-3 h-3" />
        Send Home
      </button>
    </div>
  );
};

export const WalkingPet: React.FC = () => {
  const { pet, setPet } = useSystem();
  const mouse = useMousePosition();
  const [isReturning, setIsReturning] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);
  
  // Roaming states
  const [roamPos, setRoamPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [roamRotation, setRoamRotation] = useState(0);
  const [roamFacing, setRoamFacing] = useState(1);
  const [isMeandering, setIsMeandering] = useState(false);
  const [isHopping, setIsHopping] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [isTired, setIsTired] = useState(false);
  
  const [offset, setOffset] = useState({ x: 60, y: 60 });
  const holdTimer = useRef<any>(null);

  // Helper to get taskbar button position
  const getTaskbarPos = () => {
    const el = document.getElementById('taskbar-skniigachi');
    if (el) {
      const rect = el.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return { x: window.innerWidth / 2, y: window.innerHeight - 20 };
  };

  // Organic Roaming Logic
  useEffect(() => {
    if (!pet.isRoaming || pet.isSleeping || pet.stayPosition || !pet.isWalking) {
      setIsMeandering(false);
      setIsZooming(false);
      setIsHopping(false);
      return;
    }

    let timeoutId: any;

    const planNextMove = () => {
      const behavior = Math.random();

      // If tired, 40% chance to fall asleep if energy is low
      if (isTired && behavior < 0.4 && pet.energy < 80) {
        setPet(prev => ({ ...prev, isSleeping: true }));
        setIsTired(false);
        setIsZooming(false);
        return;
      }

      // Check for spontaneous sleep
      if (!isZooming && behavior < 0.05 && pet.energy < 60) {
        setPet(prev => ({ ...prev, isSleeping: true }));
        return;
      }

      // Check for Zoomies (infrequent)
      if (!isZooming && !isTired && behavior < 0.08) {
        setIsZooming(true);
        setIsHopping(false);
        // Zoomies duration
        setTimeout(() => {
          setIsZooming(false);
          setIsTired(true);
          // Tires out after 10-15 seconds
        }, Math.random() * 5000 + 10000);
      }

      const moveChance = isZooming ? 0.9 : 0.4;
      
      if (behavior > moveChance) {
        // IDLE / STAY PUT
        setIsMeandering(false);
        setIsHopping(false);
        setRoamRotation((Math.random() - 0.5) * 10);
        timeoutId = setTimeout(planNextMove, isZooming ? 500 : Math.random() * 5000 + 3000);
      } else {
        // MOVE
        const zoomieFactor = isZooming ? 2 : 1;
        const isLongDistance = !isZooming && Math.random() < 0.2; // 20% chance for a long slide
        
        const distRange = isLongDistance ? 300 : (isZooming ? 200 : 80);
        const targetX = Math.max(50, Math.min(window.innerWidth - 50, roamPos.x + (Math.random() - 0.5) * distRange * zoomieFactor));
        const targetY = Math.max(50, Math.min(window.innerHeight - 50, roamPos.y + (Math.random() - 0.5) * distRange * zoomieFactor));
        
        setIsHopping(!isLongDistance && !isZooming); // Hop for local movement
        setIsMeandering(isLongDistance || isZooming); // Slide for zoomies or long distances
        
        setRoamRotation((targetX - roamPos.x) > 0 ? 10 : -10);
        setRoamFacing((targetX - roamPos.x) > 0 ? 1 : -1);
        setRoamPos({ x: targetX, y: targetY });
        
        const waitTime = isZooming ? 400 : (isLongDistance ? 4000 : 1500);
        timeoutId = setTimeout(planNextMove, waitTime + Math.random() * 1000);
      }
    };

    planNextMove();
    return () => clearTimeout(timeoutId);
  }, [pet.isRoaming, pet.isSleeping, pet.stayPosition, pet.isWalking, roamPos, pet.energy, setPet, isZooming, isTired]);

  // Handle waking up
  useEffect(() => {
    if (pet.isRoaming && pet.isSleeping && pet.isWalking) {
      const timeout = setTimeout(() => {
        setPet(prev => ({ ...prev, isSleeping: false }));
      }, Math.random() * 15000 + 15000); 
      return () => clearTimeout(timeout);
    }
  }, [pet.isRoaming, pet.isSleeping, pet.isWalking, setPet]);

  // Dynamic Offset follow logic
  useEffect(() => {
    if (Math.abs(mouse.vx) > 1 || Math.abs(mouse.vy) > 1) {
      setOffset({
        x: mouse.vx > 0 ? -80 : 80,
        y: mouse.vy > 0 ? -80 : 80
      });
    }
  }, [mouse.vx, mouse.vy]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && pet.stayPosition) {
        setPet(prev => ({ ...prev, stayPosition: null }));
      }
      if (e.button === 1) {
        holdTimer.current = setTimeout(() => {
          setPet(prev => ({ 
            ...prev, 
            stayPosition: { x: e.clientX, y: e.clientY }, 
            isRoaming: false 
          }));
        }, 1000);
      }
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1 && holdTimer.current) {
        clearTimeout(holdTimer.current);
        holdTimer.current = null;
      }
    };
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [pet.stayPosition, setPet]);

  if ((!pet.isWalking && !isReturning) || (pet.isSleeping && !pet.isRoaming) || pet.stage === 'egg') return null;

  const handleReturn = () => {
    setIsReturning(true);
    setPet(prev => ({ ...prev, stayPosition: null, isRoaming: false }));
    setTimeout(() => {
      setPet(prev => ({ ...prev, isWalking: false }));
      setIsReturning(false);
    }, 800);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const getMood = (): any => {
    if (pet.isDead) return 'dead';
    if (pet.isSleeping) return 'sleeping';
    if (isZooming) return 'happy';
    if (Math.abs(mouse.vx) > 50 || Math.abs(mouse.vy) > 50) return 'surprised';
    if (pet.hunger < 20) return 'hungry';
    if (pet.happiness > 80) return 'happy';
    if (pet.happiness < 30) return 'sad';
    return 'idle';
  };

  const taskbar = getTaskbarPos();
  let targetX = mouse.x + offset.x;
  let targetY = mouse.y + offset.y;
  let rotation = mouse.vx * 2;
  let facing = offset.x < 0 ? 1 : -1;

  if (pet.stayPosition) {
    targetX = pet.stayPosition.x;
    targetY = pet.stayPosition.y;
    rotation = 0;
    facing = 1;
  } else if (pet.isRoaming) {
    targetX = roamPos.x;
    targetY = roamPos.y;
    rotation = roamRotation;
    facing = roamFacing;
  }

  const isMoving = Math.abs(mouse.vx) > 1 || Math.abs(mouse.vy) > 1 || isMeandering || isHopping;
  const baseScaleX = isMoving ? [1, 1.15, 1] : [1, 1.05, 1];

  return (
    <>
    <motion.div
      initial={{ x: taskbar.x, y: taskbar.y, scale: 0, opacity: 0 }}
      animate={isReturning ? {
        x: taskbar.x - 32,
        y: taskbar.y - 32,
        scale: 0,
        opacity: 0,
        rotate: 0
      } : { 
        x: targetX - 32, 
        y: targetY - 32,
        scale: 1.0,
        opacity: 1,
        rotate: rotation,
        scaleY: isMoving ? [1, 0.85, 1] : [1, 1.05, 1],
        scaleX: Array.isArray(baseScaleX) ? baseScaleX.map(s => s * facing) : (baseScaleX as number) * facing,
        ...(isHopping ? { y: [targetY - 32, targetY - 52, targetY - 32] } : {})
      }}
      transition={{ 
        x: { type: 'spring', damping: isZooming ? 15 : 20, stiffness: isZooming ? 150 : 70, restDelta: 0.001 },
        y: isHopping ? { duration: 0.4, repeat: 0, ease: "easeOut" } : { type: 'spring', damping: 20, stiffness: 70, restDelta: 0.001 },
        scaleY: { repeat: Infinity, duration: isMoving ? (isZooming ? 0.15 : 0.25) : 2 },
        scaleX: { repeat: Infinity, duration: isMoving ? (isZooming ? 0.15 : 0.25) : 2 },
        opacity: { duration: 0.3 }
      }}
      onContextMenu={handleContextMenu}
      className="fixed top-0 left-0 z-[150] pointer-events-auto flex flex-col items-center gap-1 group w-fit h-fit cursor-pointer"
    >
      <div className="drop-shadow-[0_0_12px_rgba(0,0,0,0.6)] flex items-center justify-center">
        <PetSprite data={pet.customSprite} size={64} palette={pet.palette} fallbackColor="#d1d5db" mood={getMood()} />
      </div>
      
      <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="text-[10px] font-bold uppercase text-white bg-black/60 px-2 py-0.5 win95-outset border-none">
          {pet.isSleeping ? '[SLEEPING]' : isZooming ? '[ZOOMIES!]' : isTired ? '[TIRED]' : pet.stayPosition ? '[STAYING]' : pet.isRoaming ? (isMeandering || isHopping ? '[EXPLORING]' : '[IDLE]') : pet.name}
        </span>
      </div>
    </motion.div>

    <AnimatePresence>
      {contextMenu && (
        <PetContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          isRoaming={pet.isRoaming}
          onClose={() => setContextMenu(null)}
          onSendHome={handleReturn}
          onToggleRoam={() => setPet(prev => ({ ...prev, isRoaming: !prev.isRoaming, stayPosition: null }))}
        />
      )}
    </AnimatePresence>
    </>
  );
};
