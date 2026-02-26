import React from 'react';
import { motion } from 'framer-motion';
import { X, Square, Minus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface WindowProps {
  title: string;
  icon: any;
  children: React.ReactNode;
  onClose?: () => void;
  defaultPosition?: { x: number, y: number };
}

export const Window: React.FC<WindowProps> = ({ title, icon: Icon, children, onClose, defaultPosition }) => {
  const { theme } = useTheme();

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0, x: defaultPosition?.x ?? 0, y: defaultPosition?.y ?? 0 }}
      animate={{ scale: 1, opacity: 1 }}
      drag
      dragMomentum={false}
      className="win95-outset surface-grit absolute w-full max-w-md overflow-hidden flex flex-col z-50 pointer-events-auto"
      style={{ minWidth: '300px' }}
    >
      {/* Title Bar */}
      <div 
        className="p-1 flex items-center justify-between cursor-move select-none relative z-10"
        style={{ backgroundColor: `${theme.primary}33` }}
      >
        <div className="flex items-center gap-2 px-1">
          <Icon className="w-4 h-4" style={{ color: theme.primary }} />
          <span className="font-bold text-xs uppercase tracking-tight text-white">{title}</span>
        </div>
        <div className="flex gap-1">
          <button className="win95-outset p-0.5 bg-gray-800 hover:bg-gray-700 pointer-events-auto"><Minus className="w-3 h-3 text-gray-400" /></button>
          <button className="win95-outset p-0.5 bg-gray-800 hover:bg-gray-700 pointer-events-auto"><Square className="w-3 h-3 text-gray-400" /></button>
          <button 
            onClick={onClose}
            className="win95-outset p-0.5 bg-gray-800 hover:bg-red-900 pointer-events-auto group"
          >
            <X className="w-3 h-3 group-hover:text-white" style={{ color: theme.secondary }} />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 win95-inset m-1 text-sm font-mono text-gray-300 min-h-[100px] bg-black/40 backdrop-blur-sm relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
