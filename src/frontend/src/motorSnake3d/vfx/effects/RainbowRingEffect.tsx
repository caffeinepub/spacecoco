import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RainbowRingEffectProps {
  position: THREE.Vector3;
  onComplete: () => void;
}

export function RainbowRingEffect({ position, onComplete }: RainbowRingEffectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());
  const lifetime = 2;

  useFrame((state) => {
    if (!meshRef.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    const progress = elapsed / lifetime;

    if (progress >= 1) {
      onComplete();
      return;
    }

    // Expand and fade
    const scale = 1 + progress * 5;
    meshRef.current.scale.set(scale, scale, 1);

    if (meshRef.current.material instanceof THREE.MeshBasicMaterial) {
      meshRef.current.material.opacity = 1 - progress;
    }

    // Face camera
    meshRef.current.lookAt(state.camera.position);
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
    <mesh ref={meshRef} position={position}>
      <ringGeometry args={[0.5, 1, 32]} />
      <meshBasicMaterial
        color="#ff00ff"
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
