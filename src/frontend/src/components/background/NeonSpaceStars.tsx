import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StarData {
  position: THREE.Vector3;
  velocity: number;
  phase: number;
  size: number;
}

interface NeonSpaceStarsProps {
  count?: number;
  onPositionsUpdate?: (positions: THREE.Vector3[]) => void;
}

export function NeonSpaceStars({ count = 200, onPositionsUpdate }: NeonSpaceStarsProps) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const { geometry, material, starData } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const data: StarData[] = [];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Distribute stars across viewport
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 60;
      positions[i3 + 2] = (Math.random() - 0.5) * 20 - 10;

      // Electric neon colors (cyan, magenta, acid green)
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i3] = 0.0;
        colors[i3 + 1] = 1.0;
        colors[i3 + 2] = 1.0;
      } else if (colorChoice < 0.66) {
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.0;
        colors[i3 + 2] = 1.0;
      } else {
        colors[i3] = 0.5;
        colors[i3 + 1] = 1.0;
        colors[i3 + 2] = 0.0;
      }

      sizes[i] = Math.random() * 0.8 + 0.4;

      data.push({
        position: new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]),
        velocity: Math.random() * 2 + 1,
        phase: Math.random() * Math.PI * 2,
        size: sizes[i],
      });
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geom, material: mat, starData: data };
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const sizes = pointsRef.current.geometry.attributes.size.array as Float32Array;
    const time = state.clock.elapsedTime;

    const currentPositions: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const star = starData[i];

      // Horizontal drift with wrapping
      star.position.x += star.velocity * delta * 5;
      if (star.position.x > 50) {
        star.position.x = -50;
      }

      positions[i3] = star.position.x;
      positions[i3 + 1] = star.position.y;
      positions[i3 + 2] = star.position.z;

      currentPositions.push(star.position.clone());

      // Twinkling effect
      const twinkle = Math.sin(time * 3 + star.phase) * 0.5 + 0.5;
      sizes[i] = star.size * (0.5 + twinkle * 0.5);
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.size.needsUpdate = true;

    // Notify parent of current positions
    if (onPositionsUpdate) {
      onPositionsUpdate(currentPositions);
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
