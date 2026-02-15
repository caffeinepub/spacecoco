import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LaserPulse {
  id: string;
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  startTime: number;
  lifetime: number;
}

interface HeroCowEyeLaserVfxProps {
  cowPositions: THREE.Vector3[];
  ufoPosition: THREE.Vector3;
}

export function HeroCowEyeLaserVfx({ cowPositions, ufoPosition }: HeroCowEyeLaserVfxProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pulsesRef = useRef<LaserPulse[]>([]);
  const lastPulseTime = useRef(0);

  const laserMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#ff0088',
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const delta = state.clock.getDelta();

    // Spawn laser pulses periodically
    if (time - lastPulseTime.current > 0.4) {
      const randomCowIndex = Math.floor(Math.random() * cowPositions.length);
      const cowPos = cowPositions[randomCowIndex];
      const eyePos = cowPos.clone().add(new THREE.Vector3(1.5, 0.5, 0));

      const pulse: LaserPulse = {
        id: `laser-${Date.now()}-${randomCowIndex}`,
        startPos: eyePos,
        targetPos: ufoPosition.clone(),
        startTime: time,
        lifetime: 0.5,
      };

      pulsesRef.current.push(pulse);
      lastPulseTime.current = time;
    }

    // Update and render pulses
    if (!groupRef.current) return;

    // Clear old meshes
    while (groupRef.current.children.length > 0) {
      const child = groupRef.current.children[0];
      groupRef.current.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    }

    // Render active pulses
    pulsesRef.current = pulsesRef.current.filter((pulse) => {
      const age = time - pulse.startTime;
      const progress = age / pulse.lifetime;

      if (progress >= 1) return false;

      // Interpolate position
      const currentPos = pulse.startPos.clone().lerp(pulse.targetPos, progress);
      const direction = pulse.targetPos.clone().sub(pulse.startPos).normalize();
      const length = pulse.startPos.distanceTo(pulse.targetPos) * (1 - progress);

      // Create laser beam mesh
      const geometry = new THREE.CylinderGeometry(0.08, 0.08, length, 8);
      const mesh = new THREE.Mesh(geometry, laserMaterial.clone());
      
      mesh.position.copy(currentPos);
      mesh.lookAt(pulse.targetPos);
      mesh.rotateX(Math.PI / 2);

      if (mesh.material instanceof THREE.MeshBasicMaterial) {
        mesh.material.opacity = 1 - progress;
      }

      groupRef.current?.add(mesh);

      return true;
    });
  });

  return <group ref={groupRef} />;
}
