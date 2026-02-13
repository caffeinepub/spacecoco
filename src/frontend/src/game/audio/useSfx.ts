import { useRef, useCallback } from 'react';

interface SfxCache {
  [key: string]: HTMLAudioElement;
}

export function useSfx(isMuted: boolean) {
  const sfxCacheRef = useRef<SfxCache>({});
  const lastPlayedRef = useRef<{ [key: string]: number }>({});

  const playSfx = useCallback((sfxName: string, throttleMs: number = 100) => {
    if (isMuted) return;

    const now = Date.now();
    const lastPlayed = lastPlayedRef.current[sfxName] || 0;

    // Throttle to prevent excessive stacking
    if (now - lastPlayed < throttleMs) return;

    lastPlayedRef.current[sfxName] = now;

    // Get or create audio element
    if (!sfxCacheRef.current[sfxName]) {
      const audio = new Audio(`/assets/audio/spacecoco-${sfxName}.wav`);
      audio.volume = 0.3;
      sfxCacheRef.current[sfxName] = audio;
    }

    const audio = sfxCacheRef.current[sfxName];
    audio.currentTime = 0;
    audio.play().catch(err => {
      console.warn(`Failed to play SFX ${sfxName}:`, err);
    });
  }, [isMuted]);

  return { playSfx };
}
