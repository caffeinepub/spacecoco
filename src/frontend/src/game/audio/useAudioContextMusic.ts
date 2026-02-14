import { useEffect, useRef, useCallback } from 'react';

interface MusicState {
  audioContext: AudioContext | null;
  sourceNode: AudioBufferSourceNode | null;
  gainNode: GainNode | null;
  buffer: AudioBuffer | null;
  startTime: number;
  pauseTime: number;
  isReady: boolean;
  needsUnlock: boolean;
}

export function useAudioContextMusic(
  isPlaying: boolean,
  isMuted: boolean,
  intensity: number = 0.5,
  beatPhase: number = 0
) {
  const stateRef = useRef<MusicState>({
    audioContext: null,
    sourceNode: null,
    gainNode: null,
    buffer: null,
    startTime: 0,
    pauseTime: 0,
    isReady: false,
    needsUnlock: false,
  });

  // Initialize AudioContext immediately on mount
  const initAudioContext = useCallback(() => {
    if (stateRef.current.audioContext) return stateRef.current.audioContext;
    
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    stateRef.current.audioContext = ctx;
    
    // Check if context needs user gesture to unlock
    if (ctx.state === 'suspended') {
      stateRef.current.needsUnlock = true;
    }
    
    return ctx;
  }, []);

  const loadAudioBuffer = useCallback(async () => {
    const ctx = initAudioContext();

    try {
      const response = await fetch('/assets/audio/spacecoco-action-loop.mp3');
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      stateRef.current.buffer = audioBuffer;
      stateRef.current.isReady = true;
    } catch (err) {
      console.warn('Failed to load music track:', err);
    }
  }, [initAudioContext]);

  const unlockAudioContext = useCallback(async () => {
    const ctx = stateRef.current.audioContext;
    if (!ctx || ctx.state !== 'suspended') return;
    
    try {
      await ctx.resume();
      stateRef.current.needsUnlock = false;
    } catch (err) {
      console.warn('Failed to unlock audio context:', err);
    }
  }, []);

  const startPlayback = useCallback(() => {
    const state = stateRef.current;
    if (!state.audioContext || !state.buffer || !state.isReady) return;
    if (state.audioContext.state === 'suspended') return; // Wait for unlock

    // Stop existing source
    if (state.sourceNode) {
      try {
        state.sourceNode.stop();
      } catch (e) {
        // Ignore if already stopped
      }
    }

    const ctx = state.audioContext;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();

    source.buffer = state.buffer;
    source.loop = true;
    source.connect(gain);
    gain.connect(ctx.destination);

    // Start with low volume
    gain.gain.setValueAtTime(0.3, ctx.currentTime);

    const offset = state.pauseTime > 0 ? state.pauseTime : 0;
    source.start(0, offset);
    state.startTime = ctx.currentTime - offset;
    state.sourceNode = source;
    state.gainNode = gain;
  }, []);

  const stopPlayback = useCallback(() => {
    const state = stateRef.current;
    if (!state.sourceNode || !state.audioContext) return;

    const ctx = state.audioContext;
    state.pauseTime = ctx.currentTime - state.startTime;

    try {
      state.sourceNode.stop();
    } catch (e) {
      // Ignore if already stopped
    }

    state.sourceNode = null;
  }, []);

  // Update gain based on intensity and beat (not in render loop)
  useEffect(() => {
    const state = stateRef.current;
    if (!state.gainNode || !state.audioContext) return;

    const ctx = state.audioContext;
    const baseVolume = 0.3;
    const intensityBoost = intensity * 0.3;
    const beatAccent = Math.abs(Math.sin(beatPhase * Math.PI)) * 0.1;
    
    const targetVolume = isMuted ? 0 : baseVolume + intensityBoost + beatAccent;
    
    state.gainNode.gain.linearRampToValueAtTime(
      targetVolume,
      ctx.currentTime + 0.1
    );
  }, [intensity, beatPhase, isMuted]);

  // Initialize AudioContext and load buffer on mount
  useEffect(() => {
    initAudioContext();
    loadAudioBuffer();

    return () => {
      const state = stateRef.current;
      if (state.sourceNode) {
        try {
          state.sourceNode.stop();
        } catch (e) {
          // Ignore
        }
      }
      if (state.audioContext) {
        state.audioContext.close();
      }
    };
  }, [initAudioContext, loadAudioBuffer]);

  // Control playback based on state (not in render loop)
  useEffect(() => {
    if (isPlaying && !isMuted) {
      unlockAudioContext().then(() => {
        startPlayback();
      });
    } else {
      stopPlayback();
    }
  }, [isPlaying, isMuted, startPlayback, stopPlayback, unlockAudioContext]);

  return {
    audioContext: stateRef.current.audioContext,
    unlockAudioContext,
    needsUnlock: stateRef.current.needsUnlock,
  };
}
