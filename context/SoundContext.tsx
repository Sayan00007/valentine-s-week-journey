import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

type SoundType = 'hover' | 'click' | 'chime' | 'whoosh' | 'surprise';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (type: SoundType) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
    hover: null,
    click: null,
    chime: null,
    whoosh: null,
    surprise: null,
  });

  useEffect(() => {
    // Initialize Audio objects with selected Mixkit preview URLs
    
    // Flourish for hover: Magical fairy sound
    audioRefs.current.hover = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-fairy-teleport-868.mp3'); 
    
    // Clean click for UI interactions
    audioRefs.current.click = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-click-box-check-1120.mp3'); 
    
    // Gentle chime for day arrival/transition
    audioRefs.current.chime = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-happy-bells-notification-937.mp3'); 
    
    // Soft whoosh for scrolling/movement
    audioRefs.current.whoosh = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-soft-quick-wind-whoosh-1140.mp3'); 
    
    // Celebration sound for the hidden surprise
    audioRefs.current.surprise = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-completion-of-a-level-2063.mp3'); 

    // Set volumes - keeping them low for subtlety
    if (audioRefs.current.hover) audioRefs.current.hover.volume = 0.15;
    if (audioRefs.current.click) audioRefs.current.click.volume = 0.3;
    if (audioRefs.current.chime) audioRefs.current.chime.volume = 0.2;
    if (audioRefs.current.whoosh) audioRefs.current.whoosh.volume = 0.1;
    if (audioRefs.current.surprise) audioRefs.current.surprise.volume = 0.25;

    // Preload
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.load();
      }
    });
  }, []);

  const toggleMute = () => setIsMuted(prev => !prev);

  const playSound = (type: SoundType) => {
    if (isMuted) return;
    const audio = audioRefs.current[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => {
        // Auto-play policies might block this without user interaction first
        // We silently ignore these errors to prevent console spam
      });
    }
  };

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, playSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) throw new Error('useSound must be used within SoundProvider');
  return context;
};