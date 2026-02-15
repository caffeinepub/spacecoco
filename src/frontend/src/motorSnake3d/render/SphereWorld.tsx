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

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (coreRef.current) {
      const pulse = Math.sin(time * 2) * 0.1 + 1.0;
      coreRef.current.scale.setScalar(pulse);
    }
    
    if (sphereRef.current) {
      const breathe = Math.sin(time * 0.5) * 0.02 + 1.0;
      sphereRef.current.scale.setScalar(breathe);
    }
  });

  return (
    <group>
      {/* Enhanced lighting for PBR */}
      <ambientLight intensity={0.3} />
      
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0001}
      />
      
      <pointLight position={[-10, 5, -10]} intensity={0.8} color="#00ffaa" castShadow />
      <pointLight position={[10, -5, 10]} intensity={0.8} color="#ff00ff" castShadow />
      
      {/* Hollow sphere */}
      <mesh ref={sphereRef} receiveShadow>
        <sphereGeometry args={[30, 64, 64]} />
        <meshPhysicalMaterial
          color="#1a1a2e"
          side={THREE.DoubleSide}
          transparent
          opacity={0.3}
          roughness={0.2}
          metalness={0.8}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      {/* Pulsing core */}
      <mesh ref={coreRef} castShadow>
        <sphereGeometry args={[2, 32, 32]} />
        <meshPhysicalMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={3.0}
          roughness={0.1}
          metalness={0.9}
          clearcoat={1.0}
        />
      </mesh>
      
      {/* Shadow-receiving ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -30, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
      
      {/* Fog */}
      <fog attach="fog" args={['#000000', 20, 60 + fogIntensity * 20]} />
    </group>
  );
}
