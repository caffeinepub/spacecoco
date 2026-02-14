import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SphereWorldProps {
  worldMode: 'inside' | 'outside';
  abyssMode: boolean;
  fogIntensity: number;
}

export function SphereWorld({ worldMode, abyssMode, fogIntensity }: SphereWorldProps) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff6600" />

      {/* Fog */}
      <fog attach="fog" args={['#000000', 10, 50 * (1 + fogIntensity)]} />

      {/* Hollow Sphere */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[30, 64, 64]} />
        <meshStandardMaterial
          color={abyssMode ? '#330033' : '#1a1a2e'}
          side={worldMode === 'inside' ? THREE.BackSide : THREE.FrontSide}
          wireframe={false}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Red Core */}
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={abyssMode ? 2 : 1}
        />
      </mesh>

      {/* Abyss Tentacles (simplified) */}
      {abyssMode && (
        <>
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 15;
            const z = Math.sin(angle) * 15;
            
            return (
              <mesh key={i} position={[x, 0, z]}>
                <cylinderGeometry args={[0.5, 0.5, 20, 8]} />
                <meshStandardMaterial
                  color="#00ff88"
                  emissive="#00ff88"
                  emissiveIntensity={1}
                />
              </mesh>
            );
          })}
        </>
      )}

      {/* Grid helper for reference */}
      <gridHelper args={[100, 20, '#444444', '#222222']} />
    </>
  );
}
