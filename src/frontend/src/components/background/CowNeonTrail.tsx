import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CowNeonTrailProps {
  targetPosition: THREE.Vector3;
  color?: string;
}

export function CowNeonTrail({ targetPosition, color = '#ff00ff' }: CowNeonTrailProps) {
  const lineRef = useRef<THREE.Line>(null);
  const positions = useRef<THREE.Vector3[]>([]);
  const maxLength = 20;

  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  const material = useMemo(() => new THREE.LineBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    linewidth: 2,
  }), [color]);

  useEffect(() => {
    // Initialize trail positions
    for (let i = 0; i < maxLength; i++) {
      positions.current.push(targetPosition.clone());
    }
  }, [targetPosition, maxLength]);

  useFrame(() => {
    if (!lineRef.current) return;

    // Add new position at the front
    positions.current.unshift(targetPosition.clone());
    
    // Remove oldest position
    if (positions.current.length > maxLength) {
      positions.current.pop();
    }

    // Update geometry
    const posArray = new Float32Array(positions.current.length * 3);
    
    positions.current.forEach((pos, i) => {
      posArray[i * 3] = pos.x;
      posArray[i * 3 + 1] = pos.y;
      posArray[i * 3 + 2] = pos.z;
    });

    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(posArray, 3)
    );
    geometry.attributes.position.needsUpdate = true;
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return <primitive object={new THREE.Line(geometry, material)} ref={lineRef} />;
}
