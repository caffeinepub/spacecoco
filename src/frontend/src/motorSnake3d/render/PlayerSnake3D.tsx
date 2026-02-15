import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState } from '../state/gameState';
import { NEON_COLORS } from './neonStyle';
import { createPBRSnakeMaterial } from './enemyModelRigging';

export function PlayerSnake3D() {
  const gameState = useGameState();
  const headRef = useRef<THREE.Mesh>(null);
  const tailGroupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (headRef.current) {
      headRef.current.position.copy(gameState.player.position);
      
      if (materialRef.current) {
        const pulse = Math.sin(time * 3) * 0.5 + 0.5;
        materialRef.current.emissiveIntensity = 1.5 + pulse * 1.5;
      }
    }
    
    if (tailGroupRef.current) {
      tailGroupRef.current.children.forEach((segment, i) => {
        if (i < gameState.tailSegments.length) {
          const tailSeg = gameState.tailSegments[i];
          segment.position.copy(tailSeg.position);
          segment.rotation.copy(tailSeg.rotation);
          segment.scale.setScalar(tailSeg.scale);
          
          const mesh = segment as THREE.Mesh;
          const mat = mesh.material as THREE.MeshPhysicalMaterial;
          if (mat) {
            const phaseOffset = i * 0.3;
            const pulse = Math.sin(time * 3 + phaseOffset) * 0.5 + 0.5;
            mat.emissiveIntensity = 1.0 + pulse * 1.0;
          }
        }
      });
    }
  });

  const headMaterial = createPBRSnakeMaterial(NEON_COLORS.acidGreen);
  materialRef.current = headMaterial;

  return (
    <group>
      <mesh ref={headRef} castShadow receiveShadow material={headMaterial}>
        <sphereGeometry args={[1, 32, 32]} />
      </mesh>
      
      <group ref={tailGroupRef}>
        {gameState.tailSegments.map((_, i) => (
          <mesh key={i} castShadow receiveShadow material={createPBRSnakeMaterial(NEON_COLORS.acidGreen)}>
            <sphereGeometry args={[0.9, 32, 32]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
