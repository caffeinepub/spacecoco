import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { CowNeonTrail } from './CowNeonTrail';

interface FlyingCowPBRProps {
  position: [number, number, number];
  scale?: number;
  speed?: number;
  pathRadius?: number;
}

export function FlyingCowPBR({ 
  position, 
  scale = 1, 
  speed = 0.5,
  pathRadius = 5 
}: FlyingCowPBRProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const worldPositionRef = useRef(new THREE.Vector3());
  
  const [baseColorMap, normalMap, roughnessMap] = useLoader(THREE.TextureLoader, [
    '/assets/generated/cow-pbr-basecolor.dim_4096x4096.png',
    '/assets/generated/cow-pbr-normal.dim_4096x4096.png',
    '/assets/generated/cow-pbr-roughness.dim_4096x4096.png',
  ]);

  // Balloon-plastic PBR material matching hero cows
  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      map: baseColorMap,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
      roughness: 0.15,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      envMapIntensity: 2.5,
      reflectivity: 1.0,
    });
  }, [baseColorMap, normalMap, roughnessMap]);

  const initialPhase = useMemo(() => Math.random() * Math.PI * 2, []);
  const trailColor = useMemo(() => ['#ff00ff', '#00ffff', '#00ff00'][Math.floor(Math.random() * 3)], []);

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return;

    const time = state.clock.elapsedTime * speed;
    const phase = time + initialPhase;

    // Circular floating path
    groupRef.current.position.x = position[0] + Math.cos(phase) * pathRadius;
    groupRef.current.position.y = position[1] + Math.sin(phase * 0.7) * 2;
    groupRef.current.position.z = position[2] + Math.sin(phase * 0.5) * 3;

    // Gentle rotation
    groupRef.current.rotation.y = phase * 0.3;
    
    // Bobbing animation
    meshRef.current.position.y = Math.sin(time * 2) * 0.2;

    // Update world position for trail
    groupRef.current.getWorldPosition(worldPositionRef.current);
  });

  return (
    <>
      <group ref={groupRef}>
        <mesh ref={meshRef} castShadow receiveShadow material={material} scale={scale}>
          {/* Cow body */}
          <boxGeometry args={[2, 1.2, 1.5]} />
        </mesh>
        
        {/* Head */}
        <mesh position={[1.2, 0.2, 0]} castShadow material={material} scale={scale}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
        </mesh>
        
        {/* Legs */}
        {[
          [-0.5, -0.8, 0.5],
          [-0.5, -0.8, -0.5],
          [0.5, -0.8, 0.5],
          [0.5, -0.8, -0.5],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} castShadow material={material} scale={scale}>
            <cylinderGeometry args={[0.15, 0.15, 0.6, 8]} />
          </mesh>
        ))}
      </group>
      
      {/* Neon trail */}
      <CowNeonTrail targetPosition={worldPositionRef.current} color={trailColor} />
    </>
  );
}
