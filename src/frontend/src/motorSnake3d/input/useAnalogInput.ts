import { useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';

export function useAnalogInput() {
  const [analogVector, setAnalogVector] = useState(new THREE.Vector2(0, 0));
  const [acceleration, setAcceleration] = useState(0);
  const [brake, setBrake] = useState(false);
  const [shake, setShake] = useState(false);

  // Keyboard input (desktop fallback)
  useEffect(() => {
    const keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;

      if (e.key === ' ') {
        setBrake(true);
      }
      if (e.key.toLowerCase() === 's' && e.shiftKey) {
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
  }, []);

  const setJoystickInput = useCallback((x: number, y: number, accel: number) => {
    setAnalogVector(new THREE.Vector2(x, y));
    setAcceleration(accel);
  }, []);

  return {
    analogVector,
    acceleration,
    brake,
    shake,
    setJoystickInput,
  };
}
