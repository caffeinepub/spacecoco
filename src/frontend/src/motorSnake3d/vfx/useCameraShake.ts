import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ShakeState {
  active: boolean;
  intensity: number;
  duration: number;
  elapsed: number;
  originalPosition: THREE.Vector3;
}

export function useCameraShake() {
  const shakeState = useRef<ShakeState>({
    active: false,
    intensity: 0,
    duration: 0,
    elapsed: 0,
    originalPosition: new THREE.Vector3(),
  });

  useFrame((state, delta) => {
    if (!shakeState.current.active) return;

    const shake = shakeState.current;
    shake.elapsed += delta;

    if (shake.elapsed >= shake.duration) {
      // Reset camera to original position
      state.camera.position.copy(shake.originalPosition);
      shake.active = false;
      return;
    }

    // Apply shake with decay
    const progress = shake.elapsed / shake.duration;
    const currentIntensity = shake.intensity * (1 - progress);

    state.camera.position.x = shake.originalPosition.x + (Math.random() - 0.5) * currentIntensity;
    state.camera.position.y = shake.originalPosition.y + (Math.random() - 0.5) * currentIntensity;
    state.camera.position.z = shake.originalPosition.z + (Math.random() - 0.5) * currentIntensity * 0.5;
  });

  const triggerShake = (intensity: number = 2, duration: number = 0.5) => {
    shakeState.current = {
      active: true,
      intensity,
      duration,
      elapsed: 0,
      originalPosition: new THREE.Vector3(0, 0, 50),
    };
  };

  return { triggerShake };
}
