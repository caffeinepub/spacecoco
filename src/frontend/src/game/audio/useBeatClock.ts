import { useEffect, useRef, useState } from 'react';

const BEAT_INTERVAL = 0.5; // 500ms per beat

export function useBeatClock(isPlaying: boolean, audioContext: AudioContext | null) {
  const [beatPhase, setBeatPhase] = useState(0);
  const nextBeatTimeRef = useRef(0);
  const schedulerIdRef = useRef<number>(0);
  const startTimeRef = useRef(0);

  useEffect(() => {
    if (!isPlaying || !audioContext) {
      cancelAnimationFrame(schedulerIdRef.current);
      return;
    }

    startTimeRef.current = audioContext.currentTime;
    nextBeatTimeRef.current = startTimeRef.current;

    const schedule = () => {
      const currentTime = audioContext.currentTime;
      
      // Schedule beats with lookahead
      while (nextBeatTimeRef.current < currentTime + 0.1) {
        nextBeatTimeRef.current += BEAT_INTERVAL;
      }

      // Update phase for visual/gain sync
      const elapsed = currentTime - startTimeRef.current;
      const phase = (elapsed % BEAT_INTERVAL) / BEAT_INTERVAL;
      setBeatPhase(phase);

      schedulerIdRef.current = requestAnimationFrame(schedule);
    };

    schedule();

    return () => {
      cancelAnimationFrame(schedulerIdRef.current);
    };
  }, [isPlaying, audioContext]);

  return {
    beatPhase,
    currentBeat: Math.floor((audioContext?.currentTime || 0) / BEAT_INTERVAL),
  };
}
