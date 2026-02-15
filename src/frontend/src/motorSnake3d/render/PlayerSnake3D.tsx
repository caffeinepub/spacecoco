import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState } from '../state/gameState';

export function PlayerSnake3D() {
  const gameState = useGameState();
  const segmentRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Update head
    if (segmentRefs.current[0]) {
      const head = segmentRefs.current[0];
      head.position.copy(gameState.player.position);
      
      // Pulse effect
      const pulse = Math.sin(time * 4) * 0.5 + 0.5;
      if (head.material instanceof THREE.MeshStandardMaterial) {
        head.material.emissiveIntensity = 1 + pulse;
      }
    }

    // Update tail segments with phase offset
    gameState.tailSegments.forEach((segment, i) => {
      if (segmentRefs.current[i + 1]) {
        const mesh = segmentRefs.current[i + 1];
        mesh.position.copy(segment.position);
        
        // Pulse with phase offset
        const phase = (i / gameState.tailSegments.length) * Math.PI * 2;
        const pulse = Math.sin(time * 4 + phase) * 0.5 + 0.5;
        
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.emissiveIntensity = 0.5 + pulse * 0.5;
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
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Tail segments */}
      {gameState.tailSegments.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) segmentRefs.current[i + 1] = el;
          }}
        >
          <sphereGeometry args={[0.6, 12, 12]} />
          <meshStandardMaterial
            color="#00ff88"
            emissive="#00ff88"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}
