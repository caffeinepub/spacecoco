import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Meteor {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  startTime: number;
  hasExploded: boolean;
}

interface ConfettiParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  lifetime: number;
  age: number;
}

export function MeteorConfettiField() {
  const groupRef = useRef<THREE.Group>(null);
  const meteorsRef = useRef<Meteor[]>([]);
  const confettiRef = useRef<ConfettiParticle[]>([]);
  const lastMeteorTime = useRef(0);

  const confettiColors = useMemo(() => [
    new THREE.Color('#ff00ff'),
    new THREE.Color('#00ffff'),
    new THREE.Color('#ffff00'),
    new THREE.Color('#00ff00'),
    new THREE.Color('#ff6600'),
  ], []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Spawn meteors periodically
    if (time - lastMeteorTime.current > 3) {
      const startPos = new THREE.Vector3(
        (Math.random() - 0.5) * 100,
        30,
        -20 - Math.random() * 10
      );
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        -20,
        (Math.random() - 0.5) * 5
      );

      meteorsRef.current.push({
        id: `meteor-${Date.now()}`,
        position: startPos,
        velocity,
        startTime: time,
        hasExploded: false,
      });

      lastMeteorTime.current = time;
    }

    // Update meteors
    meteorsRef.current = meteorsRef.current.filter((meteor) => {
      meteor.position.add(meteor.velocity.clone().multiplyScalar(delta));

      // Check for impact
      if (meteor.position.y < -10 && !meteor.hasExploded) {
        meteor.hasExploded = true;

        // Spawn confetti burst
        for (let i = 0; i < 30; i++) {
          const angle = (i / 30) * Math.PI * 2;
          const speed = 5 + Math.random() * 10;
          confettiRef.current.push({
            position: meteor.position.clone(),
            velocity: new THREE.Vector3(
              Math.cos(angle) * speed,
              Math.random() * 10,
              Math.sin(angle) * speed
            ),
            color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            lifetime: 1 + Math.random(),
            age: 0,
          });
        }

        return false;
      }

      return meteor.position.y > -15;
    });

    // Update confetti
    confettiRef.current = confettiRef.current.filter((particle) => {
      particle.age += delta;
      particle.position.add(particle.velocity.clone().multiplyScalar(delta));
      particle.velocity.y -= 9.8 * delta; // Gravity

      return particle.age < particle.lifetime;
    });
  });

  return (
    <group ref={groupRef}>
      {/* Render meteors */}
      {meteorsRef.current.map((meteor) => (
        <mesh key={meteor.id} position={meteor.position}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshBasicMaterial
            color="#ff6600"
          />
        </mesh>
      ))}

      {/* Render confetti */}
      {confettiRef.current.map((particle, i) => (
        <mesh key={`confetti-${i}`} position={particle.position}>
          <boxGeometry args={[0.2, 0.2, 0.05]} />
          <meshBasicMaterial
            color={particle.color}
            transparent
            opacity={1 - particle.age / particle.lifetime}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
