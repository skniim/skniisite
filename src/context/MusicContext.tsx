import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

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
    url: '/audio/Sweet Mario Love[SPC700].mp3',
    artwork: '/assets/icons/sknii.svg' // Using your logo as placeholder artwork
  },
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

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    const audio = audioRef.current;
    audio.src = tracks[trackIndex].url;
    audio.load();

    const updateProgress = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => nextTrack();
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    if (isPlaying) {
      audio.play().catch(e => console.log("Playback interrupted", e));
    }

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [trackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(e => console.error("Playback failed", e));
    } else {
      audio.pause();
    }
  };

  const nextTrack = () => {
    setTrackIndex((prev) => (prev + 1) % tracks.length);
  };

  const prevTrack = () => {
    setTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Autoplay handler
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!isPlaying && audioRef.current) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => console.log("Autoplay blocked", e));
      }
      document.removeEventListener('click', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);
    return () => document.removeEventListener('click', handleFirstInteraction);
  }, [isPlaying]);

  return (
    <MusicContext.Provider value={{ 
      isPlaying, currentTrack: tracks[trackIndex], volume, currentTime, duration,
      togglePlay, nextTrack, prevTrack, setVolume, seek 
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