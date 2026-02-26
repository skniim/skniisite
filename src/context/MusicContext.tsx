import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

type Track = {
  id: number;
  title: string;
  url: string;
};

const tracks: Track[] = [
  { id: 1, title: 'SWEET_MARIO_LOVE.MP3', url: '/audio/Sweet Mario Love[SPC700].mp3' },
];

type MusicContextType = {
  isPlaying: boolean;
  currentTrack: Track;
  volume: number;
  togglePlay: () => void;
  nextTrack: () => void;
  setVolume: (v: number) => void;
};

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(tracks[trackIndex].url);
    audioRef.current.loop = true;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [trackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback failed", e));
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    const wasPlaying = isPlaying;
    if (audioRef.current) audioRef.current.pause();
    setTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(wasPlaying);
    // Auto-play next track if it was already playing
    if (wasPlaying) {
      setTimeout(() => {
        if (audioRef.current) audioRef.current.play();
      }, 100);
    }
  };

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!isPlaying && audioRef.current) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => console.log("Autoplay still blocked or failed", e));
      }
      document.removeEventListener('click', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    return () => document.removeEventListener('click', handleFirstInteraction);
  }, [isPlaying]);

  return (
    <MusicContext.Provider value={{ isPlaying, currentTrack: tracks[trackIndex], volume, togglePlay, nextTrack, setVolume }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within a MusicProvider');
  return context;
};
