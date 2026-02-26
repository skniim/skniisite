import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

type Track = {
  id: number;
  title: string;
  url: string;
  artwork?: string;
};

const tracks: Track[] = [
  { 
    id: 1, 
    title: 'SWEET_MARIO_LOVE.MP3', 
    url: '/audio/Sweet Mario Love/Sweet Mario Love[SPC700].mp3',
    artwork: '/audio/Sweet Mario Love/Sweet Mario Love[SPC700].png'
  },
  {
    id: 2,
    title: 'KINGS_FIELD_TOWER.MP3',
    url: "/audio/King's Field The Ancient City OST - The Ancient City Level 3, Tower (Extended)/King's Field The Ancient City OST - The Ancient City Level 3, Tower (Extended).mp3",
    artwork: "/audio/King's Field The Ancient City OST - The Ancient City Level 3, Tower (Extended)/King's Field The Ancient City OST - The Ancient City Level 3, Tower (Extended).png"
  }
];

type MusicContextType = {
  isPlaying: boolean;
  currentTrack: Track;
  volume: number;
  currentTime: number;
  duration: number;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (v: number) => void;
  seek: (time: number) => void;
};

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    
    const updateProgress = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setTrackIndex((prev) => (prev + 1) % tracks.length);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Sync source and volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const currentUrl = tracks[trackIndex].url;
    if (audio.src !== window.location.origin + currentUrl && !audio.src.endsWith(currentUrl)) {
      audio.src = currentUrl;
      audio.load();
      // If it was already playing, continue playing the new track
      if (isPlaying) {
        audio.play().catch(() => setIsPlaying(false));
      }
    }
  }, [trackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch((err) => {
        console.error("Playback failed:", err);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, []);

  const nextTrack = useCallback(() => {
    setTrackIndex((prev) => {
      const next = (prev + 1) % tracks.length;
      if (next === prev && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return next;
    });
    setIsPlaying(true);
  }, []);

  const prevTrack = useCallback(() => {
    setTrackIndex((prev) => {
      const next = (prev - 1 + tracks.length) % tracks.length;
      if (next === prev && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return next;
    });
    setIsPlaying(true);
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const updateVolume = useCallback((v: number) => {
    setVolume(v);
  }, []);

  // Autoplay on first interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {
          // Keep trying on next interaction if it fails? 
          // No, usually one is enough or it will never work.
        });
      }
    };
    
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  return (
    <MusicContext.Provider value={{ 
      isPlaying, currentTrack: tracks[trackIndex], volume, currentTime, duration,
      togglePlay, nextTrack, prevTrack, setVolume: updateVolume, seek 
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within a MusicProvider');
  return context;
};
