import { useEffect, useRef, useState } from 'react';

// Simple chiptune-style audio using Web Audio API
export function useChiptuneLoop(isPlaying: boolean, isMuted: boolean) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize audio context
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        setIsInitialized(true);
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    }

    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch (e) {
          // Ignore if already stopped
        }
        oscillatorRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!audioContextRef.current || !isInitialized) return;

    const audioContext = audioContextRef.current;

    if (isPlaying && !isMuted) {
      // Create oscillator for chiptune sound
      if (!oscillatorRef.current) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'square'; // Chiptune-style square wave
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3 note

        // Low volume
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();

        oscillatorRef.current = oscillator;
        gainNodeRef.current = gainNode;

        // Create a simple melody pattern
        let noteIndex = 0;
        const notes = [220, 247, 262, 294, 330, 294, 262, 247]; // A3, B3, C4, D4, E4, D4, C4, B3
        const intervalId = setInterval(() => {
          if (oscillatorRef.current && audioContext) {
            noteIndex = (noteIndex + 1) % notes.length;
            oscillatorRef.current.frequency.setValueAtTime(
              notes[noteIndex],
              audioContext.currentTime
            );
          }
        }, 400); // Change note every 400ms

        // Store interval for cleanup
        (oscillator as any)._intervalId = intervalId;
      }
    } else {
      // Stop oscillator
      if (oscillatorRef.current) {
        try {
          const intervalId = (oscillatorRef.current as any)._intervalId;
          if (intervalId) {
            clearInterval(intervalId);
          }
          oscillatorRef.current.stop();
        } catch (e) {
          // Ignore if already stopped
        }
        oscillatorRef.current = null;
        gainNodeRef.current = null;
      }
    }

    return () => {
      if (oscillatorRef.current) {
        try {
          const intervalId = (oscillatorRef.current as any)._intervalId;
          if (intervalId) {
            clearInterval(intervalId);
          }
          oscillatorRef.current.stop();
        } catch (e) {
          // Ignore
        }
        oscillatorRef.current = null;
      }
    };
  }, [isPlaying, isMuted, isInitialized]);

  return { isInitialized };
}
