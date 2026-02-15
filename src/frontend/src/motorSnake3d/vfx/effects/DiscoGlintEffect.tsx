import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DiscoGlintEffectProps {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  onComplete: () => void;
}

export function DiscoGlintEffect({ position, direction, onComplete }: DiscoGlintEffectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());
  const currentPos = useRef(position.clone());
  const lifetime = 1;

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    const progress = elapsed / lifetime;

    if (progress >= 1) {
      onComplete();
      return;
    }

    // Move along direction
    currentPos.current.add(direction.clone().multiplyScalar(delta * 20));
    meshRef.current.position.copy(currentPos.current);

    // Fade
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
      <planeGeometry args={[0.5, 2]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
