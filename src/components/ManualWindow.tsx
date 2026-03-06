import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { MANUAL_ENTRIES } from '../constants/manual';
import { BookOpen, Info, ChevronRight } from 'lucide-react';

export const ManualWindow: React.FC = () => {
  const { theme } = useTheme();
  const [activeEntryId, setActiveEntryId] = useState('get-started');
  const activeEntry = MANUAL_ENTRIES[activeEntryId];

  const categories = [
    { id: 'get-started', title: 'Get Started', icon: BookOpen },
    { id: 'about', title: 'About', icon: Info },
  ];

  return (
    <div className="flex flex-col md:flex-row h-[500px] md:h-[400px] gap-4 overflow-hidden">
      {/* Categories */}
      <div className="w-full md:w-40 flex flex-row md:flex-col gap-1 border-b md:border-b-0 md:border-r border-white/5 pb-2 md:pb-0 md:pr-4 overflow-x-auto md:overflow-x-visible custom-scrollbar shrink-0">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveEntryId(cat.id)}
            className={`flex items-center gap-2 px-3 py-2 win95-outset transition-colors text-left whitespace-nowrap md:whitespace-normal ${
              activeEntryId === cat.id ? 'bg-white/10' : 'bg-black/20 hover:bg-black/40'
            }`}
          >
            <cat.icon className="w-4 h-4 shrink-0" style={{ color: activeEntryId === cat.id ? theme.primary : theme.secondary }} />
            <span className="text-[10px] font-bold uppercase tracking-tight truncate">{cat.title}</span>
            <div className="hidden md:block ml-auto">
              {activeEntryId === cat.id && <ChevronRight className="w-3 h-3" style={{ color: theme.primary }} />}
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <h3 className="hidden md:block text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2 mb-4" style={{ color: theme.primary }}>
          {activeEntry.title}
        </h3>
        
        <div 
          className="flex-1 win95-inset p-4 overflow-y-auto custom-scrollbar"
          style={{ backgroundColor: '#050505' }}
        >
          <div className="text-xs leading-relaxed whitespace-pre-wrap font-mono text-gray-300">
            {activeEntry.content}
          </div>
        </div>
      </div>
    </div>
  );
};
