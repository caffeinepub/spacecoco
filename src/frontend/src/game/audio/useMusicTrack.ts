import { useEffect, useRef } from 'react';

export function useMusicTrack(isPlaying: boolean, isMuted: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    if (!audioRef.current) {
      audioRef.current = new Audio('/assets/audio/spacecoco-action-loop.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;
    }

    const audio = audioRef.current;

    // Control playback
    if (isPlaying && !isMuted) {
      audio.play().catch(err => {
        console.warn('Audio playback failed:', err);
      });
    } else {
      audio.pause();
    }

    // Apply mute
    audio.muted = isMuted;

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [isPlaying, isMuted]);

  return { audioRef };
}
