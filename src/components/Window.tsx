import React from 'react';
import { motion } from 'framer-motion';
import { X, Square, Minus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface WindowProps {
  title: string;
  icon: any; // Lucide icon or string path
  children: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFocus?: () => void;
  isMaximized?: boolean;
  isMinimized?: boolean;
  zIndex?: number;
  defaultPosition?: { x: number, y: number };
  flush?: boolean;
  className?: string;
}

export const Window: React.FC<WindowProps> = ({ 
  title, icon: Icon, children, onClose, onMinimize, onMaximize, onFocus,
  isMaximized, isMinimized, zIndex = 50, defaultPosition, flush = false, className = "max-w-md"
}) => {
  const { theme } = useTheme();
  const isTop = theme.taskbarPosition === 'top';

  const maximizedStyles = isMaximized ? {
    top: isTop ? '48px' : '0',
    bottom: isTop ? '0' : '48px',
    left: '0',
    right: '0',
    width: '100vw',
    height: 'calc(100vh - 48px)',
    maxWidth: 'none',
    margin: '0',
    zIndex: 1000,
    transform: 'none !important'
  } : {
    zIndex: zIndex
  };

  return (
    <motion.div 
      initial={isMaximized ? {} : { scale: 0.95, opacity: 0, x: defaultPosition?.x ?? 0, y: defaultPosition?.y ?? 0 }}
      animate={{ 
        scale: isMinimized ? 0.9 : 1, 
        opacity: isMinimized ? 0 : 1,
        pointerEvents: isMinimized ? 'none' : 'auto' 
      }}
      transition={{ duration: 0.2 }}
      drag={!isMaximized && !isMinimized}
      dragMomentum={false}
      onDragStart={onFocus}
      onMouseDown={onFocus}
      className={`win95-outset surface-grit overflow-hidden flex flex-col pointer-events-auto ${isMaximized ? 'fixed' : 'relative ' + className} ${isMinimized ? 'invisible h-0 w-0' : ''}`}
      style={{ 
        minWidth: isMaximized ? 'none' : (isMinimized ? '0' : '300px'),
        display: isMinimized ? 'none' : 'flex',
        ...maximizedStyles
      }}
    >
      {/* Title Bar */}
      <div 
        className="p-1 flex items-center justify-between cursor-move select-none relative z-10"
        style={{ backgroundColor: `${theme.primary}33` }}
        onDoubleClick={onMaximize}
      >
        <div className="flex items-center gap-2 px-1">
          {typeof Icon === 'string' ? (
            <img src={Icon} alt="" className="w-4 h-4 object-contain" style={{ filter: `drop-shadow(0 0 2px ${theme.primary}44)` }} />
          ) : (
            <Icon className="w-4 h-4" style={{ color: theme.primary }} />
          )}
          <span className="font-bold text-xs uppercase tracking-tight text-white">{title}</span>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={onMinimize}
            className="win95-outset p-0.5 bg-gray-800 hover:bg-gray-700 pointer-events-auto"
          >
            <Minus className="w-3 h-3 text-gray-400" />
          </button>
          <button 
            onClick={onMaximize}
            className="win95-outset p-0.5 bg-gray-800 hover:bg-gray-700 pointer-events-auto"
          >
            <Square className="w-3 h-3 text-gray-400" />
          </button>
          <button 
            onClick={onClose}
            className="win95-outset p-0.5 bg-gray-800 hover:bg-red-900 pointer-events-auto group"
          >
            <X className="w-3 h-3 group-hover:text-white" style={{ color: theme.secondary }} />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div 
        className={`${flush ? 'win95-inset' : 'p-4 win95-inset m-1'} flex-1 text-sm font-mono text-gray-300 min-h-[100px] bg-black/40 backdrop-blur-sm relative z-10 overflow-hidden flex flex-col`}
      >
        {children}
      </div>
    </motion.div>
  );
};
