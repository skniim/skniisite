import React from 'react';
import { Play, Pause, SkipForward, Volume2 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { useTheme } from '../context/ThemeContext';

export const MusicPlayer: React.FC = () => {
  const { isPlaying, currentTrack, volume, togglePlay, nextTrack, setVolume } = useMusic();
  const { theme } = useTheme();

  return (
    <div className="space-y-4">
      <div className="win95-inset bg-black p-2 mb-2">
        <div className="text-[10px] text-gray-500 mb-1 font-mono uppercase tracking-tighter">Now Playing:</div>
        <div className="text-xs font-bold truncate" style={{ color: theme.primary }}>
          {currentTrack.title}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button 
          onClick={togglePlay}
          className="win95-outset flex-1 py-2 flex items-center justify-center hover:bg-gray-800 active:win95-inset"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </button>
        <button 
          onClick={nextTrack}
          className="win95-outset flex-1 py-2 flex items-center justify-center hover:bg-gray-800 active:win95-inset"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase">
          <div className="flex items-center gap-1">
            <Volume2 className="w-3 h-3" /> VOL
          </div>
          <span>{Math.round(volume * 100)}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-900 appearance-none win95-inset"
          style={{ accentColor: theme.primary }}
        />
      </div>

      <div className="text-[9px] text-center text-gray-600 font-mono mt-4 italic">
        * PLEASE ENSURE TRACKS ARE IN /PUBLIC/AUDIO/
      </div>
    </div>
  );
};
