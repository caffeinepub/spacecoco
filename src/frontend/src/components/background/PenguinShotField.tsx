import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Shot {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  startTime: number;
  trail: THREE.Vector3[];
}

export function PenguinShotField() {
  const groupRef = useRef<THREE.Group>(null);
  const shotsRef = useRef<Shot[]>([]);
  const lastShotTime = useRef(0);

  const penguinPositions = useMemo(() => [
    new THREE.Vector3(-25, -5, -12),
    new THREE.Vector3(25, 8, -15),
  ], []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Spawn shots periodically
    if (time - lastShotTime.current > 2) {
      const randomPenguin = penguinPositions[Math.floor(Math.random() * penguinPositions.length)];
      const direction = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        1
      ).normalize();

      shotsRef.current.push({
        id: `shot-${Date.now()}`,
        position: randomPenguin.clone(),
        velocity: direction.multiplyScalar(15),
        startTime: time,
        trail: [],
      });

      lastShotTime.current = time;
    }

    // Update shots
    shotsRef.current = shotsRef.current.filter((shot) => {
      const age = time - shot.startTime;

      if (age > 2) return false;

      // Update position
      shot.trail.unshift(shot.position.clone());
      if (shot.trail.length > 15) {
        shot.trail.pop();
      }

      shot.position.add(shot.velocity.clone().multiplyScalar(delta));

      return true;
    });
  });

  return (
    <group ref={groupRef}>
      {/* Render shots */}
      {shotsRef.current.map((shot) => (
        <group key={shot.id}>
          {/* Projectile */}
          <mesh position={shot.position}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          {/* Pink smoke trail */}
          {shot.trail.map((pos, i) => (
            <mesh key={i} position={pos}>
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshBasicMaterial
                color="#ff69b4"
                transparent
                opacity={(1 - i / shot.trail.length) * 0.5}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
