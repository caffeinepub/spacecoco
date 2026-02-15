import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState } from '../state/gameState';
import { NEON_COLORS } from './neonStyle';

export function PlayerSnake3D() {
  const gameState = useGameState();
  const segmentRefs = useRef<THREE.Mesh[]>([]);
  const outlineRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Update head
    if (segmentRefs.current[0]) {
      const head = segmentRefs.current[0];
      head.position.copy(gameState.player.position);
      
      // Pulse effect
      const pulse = Math.sin(time * 4) * 0.5 + 0.5;
      if (head.material instanceof THREE.MeshStandardMaterial) {
        head.material.emissiveIntensity = 2 + pulse * 1.5;
      }
      
      // Outline pulse
      if (outlineRefs.current[0]) {
        const scale = 1.15 + pulse * 0.05;
        outlineRefs.current[0].scale.set(scale, scale, scale);
        outlineRefs.current[0].position.copy(head.position);
      }
    }

    // Update tail segments with phase offset
    gameState.tailSegments.forEach((segment, i) => {
      if (segmentRefs.current[i + 1]) {
        const mesh = segmentRefs.current[i + 1];
        mesh.position.copy(segment.position);
        
        // Pulse with phase offset
        const phase = (i / Math.max(gameState.tailSegments.length, 1)) * Math.PI * 2;
        const pulse = Math.sin(time * 4 + phase) * 0.5 + 0.5;
        
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.emissiveIntensity = 1.5 + pulse;
        }
        
        // Outline
        if (outlineRefs.current[i + 1]) {
          const scale = 1.12 + pulse * 0.03;
          outlineRefs.current[i + 1].scale.set(scale, scale, scale);
          outlineRefs.current[i + 1].position.copy(mesh.position);
        }
      }
    });
  });

  return (
    <group>
      {/* Head */}
      <mesh
        ref={(el) => {
          if (el) segmentRefs.current[0] = el;
        }}
      >
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshStandardMaterial
          color={NEON_COLORS.acidGreen}
          emissive={NEON_COLORS.acidGreen}
          emissiveIntensity={2}
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>
      
      {/* Head outline */}
      <mesh
        ref={(el) => {
          if (el) outlineRefs.current[0] = el;
        }}
      >
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshBasicMaterial
          color={NEON_COLORS.acidGreen}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Tail segments */}
      {gameState.tailSegments.map((_, i) => (
        <group key={i}>
          <mesh
            ref={(el) => {
              if (el) segmentRefs.current[i + 1] = el;
            }}
          >
            <sphereGeometry args={[0.7, 12, 12]} />
            <meshStandardMaterial
              color={NEON_COLORS.acidGreen}
              emissive={NEON_COLORS.acidGreen}
              emissiveIntensity={1.5}
              metalness={0.1}
              roughness={0.3}
            />
          </mesh>
          
          {/* Tail outline */}
          <mesh
            ref={(el) => {
              if (el) outlineRefs.current[i + 1] = el;
            }}
          >
            <sphereGeometry args={[0.7, 12, 12]} />
            <meshBasicMaterial
              color={NEON_COLORS.acidGreen}
              side={THREE.BackSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
