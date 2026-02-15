import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

interface PixelCloudFieldProps {
  speedMultiplier?: number;
}

export function PixelCloudField({ speedMultiplier = 1 }: PixelCloudFieldProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  const texture = useLoader(THREE.TextureLoader, '/assets/generated/pixel-clouds-tile.dim_2048x2048.png');
  
  useMemo(() => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.repeat.set(2, 2);
  }, [texture]);

  const clouds = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 40,
        -15 - Math.random() * 10,
      ] as [number, number, number],
      scale: Math.random() * 8 + 6,
      rotation: Math.random() * Math.PI * 2,
      speed: (Math.random() * 0.3 + 0.1) * speedMultiplier,
    }));
  }, [speedMultiplier]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    groupRef.current.children.forEach((child, i) => {
      const cloud = clouds[i];
      child.position.x += cloud.speed * delta * 10;
      
      if (child.position.x > 50) {
        child.position.x = -50;
      }
      
      child.rotation.z += delta * 0.1;
    });
  });

  return (
    <group ref={groupRef}>
      {clouds.map((cloud, i) => (
        <mesh key={i} position={cloud.position} rotation={[0, 0, cloud.rotation]}>
          <planeGeometry args={[cloud.scale, cloud.scale]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={0.4}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
