import { useRef, useCallback, useEffect } from 'react';

interface SfxState {
  audioContext: AudioContext | null;
  lastPlayed: { [key: string]: number };
  activeSources: Set<AudioBufferSourceNode | OscillatorNode>;
  isReady: boolean;
}

export function useAudioContextSfx(isMuted: boolean) {
  const stateRef = useRef<SfxState>({
    audioContext: null,
    lastPlayed: {},
    activeSources: new Set(),
    isReady: false,
  });

  // Initialize AudioContext immediately on mount
  const initContext = useCallback(() => {
    if (!stateRef.current.audioContext) {
      stateRef.current.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      stateRef.current.isReady = true;
    }
    return stateRef.current.audioContext;
  }, []);

  // Initialize on mount
  useEffect(() => {
    initContext();
    
    return () => {
      // Cleanup: stop all active sources
      stateRef.current.activeSources.forEach(source => {
        try {
          if ('stop' in source) {
            source.stop();
          }
        } catch (e) {
          // Ignore
        }
      });
      stateRef.current.activeSources.clear();
    };
  }, [initContext]);

  const playHiss = useCallback((throttleMs: number = 1000) => {
    if (isMuted || !stateRef.current.isReady) return;

    const now = Date.now();
    const lastPlayed = stateRef.current.lastPlayed['hiss'] || 0;
    if (now - lastPlayed < throttleMs) return;
    stateRef.current.lastPlayed['hiss'] = now;

    const ctx = stateRef.current.audioContext;
    if (!ctx || ctx.state === 'suspended') return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);

    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 5;

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);

    stateRef.current.activeSources.add(osc);
    setTimeout(() => stateRef.current.activeSources.delete(osc), 250);
  }, [isMuted]);

  const playBoing = useCallback(() => {
    if (isMuted || !stateRef.current.isReady) return;

    const ctx = stateRef.current.audioContext;
    if (!ctx || ctx.state === 'suspended') return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);

    stateRef.current.activeSources.add(osc);
    setTimeout(() => stateRef.current.activeSources.delete(osc), 200);
  }, [isMuted]);

  const playLaserBuzz = useCallback((duration: number = 0.3): (() => void) | null => {
    if (isMuted || !stateRef.current.isReady) return null;

    const ctx = stateRef.current.audioContext;
    if (!ctx || ctx.state === 'suspended') return null;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + duration);

    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    filter.Q.value = 3;

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.2, ctx.currentTime + duration - 0.05);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);

    stateRef.current.activeSources.add(osc);
    setTimeout(() => stateRef.current.activeSources.delete(osc), duration * 1000 + 50);

    return () => {
      try {
        osc.stop();
        stateRef.current.activeSources.delete(osc);
      } catch (e) {
        // Already stopped
      }
    };
  }, [isMuted]);

  // Immediately stop all sounds when muted
  useEffect(() => {
    if (isMuted) {
      stateRef.current.activeSources.forEach(source => {
        try {
          if ('stop' in source) {
            source.stop();
          }
        } catch (e) {
          // Ignore
        }
      });
      stateRef.current.activeSources.clear();
    }
  }, [isMuted]);

  return {
    playHiss,
    playBoing,
    playLaserBuzz,
  };
}
