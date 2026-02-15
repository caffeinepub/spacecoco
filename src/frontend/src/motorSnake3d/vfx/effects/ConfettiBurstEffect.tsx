import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
}

interface ConfettiBurstEffectProps {
  position: THREE.Vector3;
  onComplete: () => void;
}

export function ConfettiBurstEffect({ position, onComplete }: ConfettiBurstEffectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef(Date.now());
  const lifetime = 1.5;

  const particles = useMemo(() => {
    const colors = [
      new THREE.Color('#ff00ff'),
      new THREE.Color('#00ffff'),
      new THREE.Color('#ffff00'),
      new THREE.Color('#00ff00'),
    ];

    return Array.from({ length: 20 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 5 + Math.random() * 5;
      return {
        position: position.clone(),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.random() * 10,
          Math.sin(angle) * speed
        ),
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });
  }, [position]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    const progress = elapsed / lifetime;

    if (progress >= 1) {
      onComplete();
      return;
    }

    // Update particles
    particles.forEach((particle, i) => {
      particle.position.add(particle.velocity.clone().multiplyScalar(delta));
      particle.velocity.y -= 9.8 * delta; // Gravity

      const child = groupRef.current!.children[i];
      if (child) {
        child.position.copy(particle.position);
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
          child.material.opacity = 1 - progress;
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
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <boxGeometry args={[0.2, 0.2, 0.05]} />
          <meshBasicMaterial
            color={particle.color}
            transparent
            opacity={1}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
