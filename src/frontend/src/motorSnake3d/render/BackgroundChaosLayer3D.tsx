import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NEON_COLORS } from './neonStyle';

interface DriftingProp {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
}

export function BackgroundChaosLayer3D() {
  const groupRef = useRef<THREE.Group>(null);
  const props = useRef<DriftingProp[]>([]);

  // Initialize props
  if (props.current.length === 0) {
    const colors = [
      NEON_COLORS.acidGreen,
      NEON_COLORS.hotPink,
      NEON_COLORS.neonOrange,
      NEON_COLORS.electricCyan,
    ];

    for (let i = 0; i < 15; i++) {
      props.current.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 60
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 0.3 + Math.random() * 0.5,
      });
    }
  }

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    props.current.forEach((prop, i) => {
      // Update position
      prop.position.add(prop.velocity.clone().multiplyScalar(delta));

      // Bounce at bounds
      const maxDist = 35;
      if (Math.abs(prop.position.x) > maxDist) prop.velocity.x *= -1;
      if (Math.abs(prop.position.y) > maxDist) prop.velocity.y *= -1;
      if (Math.abs(prop.position.z) > maxDist) prop.velocity.z *= -1;

      // Update mesh
      const child = groupRef.current!.children[i];
      if (child) {
        child.position.copy(prop.position);
        child.rotation.x += delta;
        child.rotation.y += delta * 0.5;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {props.current.map((prop, i) => (
        <mesh key={i} position={prop.position}>
          <octahedronGeometry args={[prop.size, 0]} />
          <meshBasicMaterial
            color={prop.color}
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
