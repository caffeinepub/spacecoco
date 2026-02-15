import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NEON_COLORS } from '../../render/neonStyle';

interface LaserBeamEffectProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color?: THREE.Color;
  onComplete: () => void;
}

export function LaserBeamEffect({ start, end, color = NEON_COLORS.laserRed, onComplete }: LaserBeamEffectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());
  const lifetime = 0.4;

  useFrame((state) => {
    if (!meshRef.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    const progress = elapsed / lifetime;

    if (progress >= 1) {
      onComplete();
      return;
    }

    // Position and orient beam
    const direction = end.clone().sub(start);
    const length = direction.length();
    const midpoint = start.clone().add(direction.clone().multiplyScalar(0.5));
    
    meshRef.current.position.copy(midpoint);
    meshRef.current.lookAt(end);
    meshRef.current.scale.set(1, 1, length);

    // Fade out
    if (meshRef.current.material instanceof THREE.MeshBasicMaterial) {
      meshRef.current.material.opacity = 1 - progress;
    }
  });

  useEffect(() => {
    return () => {
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        if (meshRef.current.material instanceof THREE.Material) {
          meshRef.current.material.dispose();
        }
      }
    };
  }, []);

  return (
    <mesh ref={meshRef}>
      <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
