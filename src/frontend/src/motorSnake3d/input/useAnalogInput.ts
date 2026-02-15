import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useInputState } from './inputState';

export function useAnalogInput() {
  const { analogVector, acceleration, brake, shake, setAnalogVector, setAcceleration, setBrake, setShake } = useInputState();
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const tiltSupportedRef = useRef(false);

  useEffect(() => {
    const keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;

      if (e.key === ' ') {
        e.preventDefault();
        setBrake(true);
      }
      if (e.key.toLowerCase() === 's' && e.shiftKey) {
        e.preventDefault();
        setShake(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;

      if (e.key === ' ') {
        setBrake(false);
      }
      if (e.key.toLowerCase() === 's') {
        setShake(false);
      }
    };

    const updateFromKeys = () => {
      let x = 0;
      let y = 0;

      if (keys['arrowleft'] || keys['a']) x -= 1;
      if (keys['arrowright'] || keys['d']) x += 1;
      if (keys['arrowup'] || keys['w']) y += 1;
      if (keys['arrowdown'] || keys['s']) y -= 1;

      const vec = new THREE.Vector2(x, y);
      if (vec.length() > 0) {
        vec.normalize();
      }

      setAnalogVector(vec);
      setAcceleration(vec.length());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const interval = setInterval(updateFromKeys, 16);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(interval);
    };
  }, [setAnalogVector, setAcceleration, setBrake, setShake]);

  useEffect(() => {
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      tiltSupportedRef.current = true;
    } else if (typeof DeviceOrientationEvent !== 'undefined') {
      tiltSupportedRef.current = true;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (!tiltSupportedRef.current) return;
      
      const beta = event.beta || 0;
      const gamma = event.gamma || 0;
      
      const tiltX = Math.max(-1, Math.min(1, gamma / 30));
      const tiltY = Math.max(-1, Math.min(1, (beta - 45) / 30));
      
      const tiltVec = new THREE.Vector2(tiltX, tiltY);
      if (tiltVec.length() > 0.1) {
        setAnalogVector(tiltVec);
        setAcceleration(Math.min(1, tiltVec.length()));
      }
    };

    if (tiltSupportedRef.current) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      if (tiltSupportedRef.current) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [setAnalogVector, setAcceleration]);

  return {
    analogVector,
    acceleration,
    brake,
    shake,
  };
}
