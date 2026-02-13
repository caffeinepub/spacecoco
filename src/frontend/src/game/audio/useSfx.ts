import { useRef, useCallback } from 'react';

interface SfxCache {
  [key: string]: HTMLAudioElement;
}

export function useSfx(isMuted: boolean) {
  const sfxCacheRef = useRef<SfxCache>({});
  const lastPlayedRef = useRef<{ [key: string]: number }>({});
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSfx = useCallback((sfxName: string, throttleMs: number = 100) => {
    if (isMuted) return;

    const now = Date.now();
    const lastPlayed = lastPlayedRef.current[sfxName] || 0;

    if (now - lastPlayed < throttleMs) return;

    lastPlayedRef.current[sfxName] = now;

    if (!sfxCacheRef.current[sfxName]) {
      const audio = new Audio(`/assets/audio/spacecoco-${sfxName}.wav`);
      audio.volume = 0.4;
      sfxCacheRef.current[sfxName] = audio;
    }

    const audio = sfxCacheRef.current[sfxName];
    
    // Enhanced spatial audio simulation
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    const source = ctx.createMediaElementSource(audio);
    const gainNode = ctx.createGain();
    const panNode = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    
    // Add subtle stereo panning for spatial feel
    if (panNode) {
      panNode.pan.value = (Math.random() - 0.5) * 0.5;
      source.connect(panNode);
      panNode.connect(gainNode);
    } else {
      source.connect(gainNode);
    }
    
    gainNode.connect(ctx.destination);
    gainNode.gain.value = 0.4;

    audio.currentTime = 0;
    audio.play().catch(err => {
      console.warn(`Failed to play SFX ${sfxName}:`, err);
    });
  }, [isMuted]);

  return { playSfx };
}
