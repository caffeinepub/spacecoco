import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NEON_COLORS } from './neonStyle';

interface SphereWorldProps {
  worldMode: 'inside' | 'outside';
  abyssMode: boolean;
  fogIntensity: number;
}

export function SphereWorld({ worldMode, abyssMode, fogIntensity }: SphereWorldProps) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const shadowDecalsRef = useRef<THREE.Group>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Pulsing core
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.5;
      const pulse = Math.sin(time * 2) * 0.5 + 0.5;
      const scale = 1 + pulse * 0.1;
      coreRef.current.scale.set(scale, scale, scale);

      if (coreRef.current.material instanceof THREE.MeshStandardMaterial) {
        coreRef.current.material.emissiveIntensity = (abyssMode ? 3 : 2) + pulse;
      }
    }

    // Breathing sphere
    if (sphereRef.current) {
      const breathe = Math.sin(time * 1.5) * 0.5 + 0.5;
      if (sphereRef.current.material instanceof THREE.MeshStandardMaterial) {
        sphereRef.current.material.opacity = 0.7 + breathe * 0.15;
      }
    }

    // Dancing shadows
    if (shadowDecalsRef.current) {
      shadowDecalsRef.current.children.forEach((decal, i) => {
        const phase = (i / shadowDecalsRef.current!.children.length) * Math.PI * 2;
        decal.position.y = Math.sin(time * 2 + phase) * 2;
        decal.rotation.z = Math.sin(time + phase) * 0.3;
      });
    }
  });

  return (
    <>
      {/* Enhanced lighting with shadow support */}
      <ambientLight intensity={0.3} color="#222222" />
      
      {/* Main directional light with shadows */}
      <directionalLight
        ref={directionalLightRef}
        position={[10, 15, 10]}
        intensity={1.2}
        color={NEON_COLORS.acidGreen}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0001}
      />
      
      {/* Fill lights */}
      <pointLight position={[-10, -10, -10]} intensity={0.8} color={NEON_COLORS.hotPink} />
      <pointLight position={[0, 15, 0]} intensity={0.6} color={NEON_COLORS.neonOrange} />

      {/* Fog - black space */}
      <fog attach="fog" args={['#000000', 15, 60 * (1 + fogIntensity)]} />

      {/* Hollow Sphere with breathing - receives shadows */}
      <mesh ref={sphereRef} receiveShadow>
        <sphereGeometry args={[30, 64, 64]} />
        <meshStandardMaterial
          color={abyssMode ? '#0a0a0a' : '#000000'}
          side={worldMode === 'inside' ? THREE.BackSide : THREE.FrontSide}
          wireframe={false}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Pulsing Core */}
      <mesh ref={coreRef} position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color={NEON_COLORS.hotPink}
          emissive={NEON_COLORS.hotPink}
          emissiveIntensity={abyssMode ? 3 : 2}
        />
      </mesh>

      {/* Dancing shadow decals */}
      <group ref={shadowDecalsRef}>
        {[...Array(6)].map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const x = Math.cos(angle) * 25;
          const z = Math.sin(angle) * 25;
          
          return (
            <mesh key={i} position={[x, 0, z]} rotation={[0, -angle, 0]} receiveShadow>
              <planeGeometry args={[3, 3]} />
              <meshBasicMaterial
                color="#000000"
                transparent
                opacity={0.4}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
      </group>

      {/* Grid helper for reference */}
      <gridHelper args={[100, 20, '#111111', '#050505']} />
    </>
  );
}
