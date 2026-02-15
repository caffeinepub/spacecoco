import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PinkSmokeTrailEffectProps {
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  onComplete: () => void;
}

export function PinkSmokeTrailEffect({ startPosition, endPosition, onComplete }: PinkSmokeTrailEffectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef(Date.now());
  const lifetime = 1;
  const trail = useRef<THREE.Vector3[]>([]);

  useFrame(() => {
    if (!groupRef.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    const progress = elapsed / lifetime;

    if (progress >= 1) {
      onComplete();
      return;
    }

    // Interpolate position
    const currentPos = new THREE.Vector3().lerpVectors(startPosition, endPosition, progress);
    trail.current.unshift(currentPos);

    if (trail.current.length > 10) {
      trail.current.pop();
    }

    // Update meshes
    groupRef.current.children.forEach((child, i) => {
      if (i < trail.current.length && child instanceof THREE.Mesh) {
        child.position.copy(trail.current[i]);
        if (child.material instanceof THREE.MeshBasicMaterial) {
          child.material.opacity = (1 - i / trail.current.length) * (1 - progress);
        }
      }
    });
  });

  useEffect(() => {
    return () => {
      if (groupRef.current) {
        groupRef.current.children.forEach(child => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (child.material instanceof THREE.Material) {
              child.material.dispose();
            }
          }
        });
      }
    };
  }, []);

  return (
    <group ref={groupRef}>
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshBasicMaterial
            color="#ff69b4"
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
