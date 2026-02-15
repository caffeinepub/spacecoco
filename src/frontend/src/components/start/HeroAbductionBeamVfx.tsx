import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HeroAbductionBeamVfxProps {
  ufoPosition: THREE.Vector3;
  targetPosition: THREE.Vector3;
  intensity: number;
}

export function HeroAbductionBeamVfx({ 
  ufoPosition, 
  targetPosition, 
  intensity 
}: HeroAbductionBeamVfxProps) {
  const outerBeamRef = useRef<THREE.Mesh>(null);
  const innerBeamRef = useRef<THREE.Mesh>(null);
  const crackleBeamRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  // Thick blue-white outer beam
  const outerBeamMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#aaccff',
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, []);

  // Bright white-blue inner core
  const innerBeamMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, []);

  // Crackling energy layer
  const crackleBeamMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#88ddff',
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame((state) => {
    if (!outerBeamRef.current || !innerBeamRef.current || !crackleBeamRef.current || !glowRef.current) return;

    const time = state.clock.elapsedTime;

    // Position beam between UFO and target
    const beamStart = ufoPosition.clone().add(new THREE.Vector3(0, -1, 0));
    const beamEnd = targetPosition.clone();
    const beamCenter = beamStart.clone().lerp(beamEnd, 0.5);
    const beamLength = beamStart.distanceTo(beamEnd);

    // Outer thick beam
    outerBeamRef.current.position.copy(beamCenter);
    outerBeamRef.current.lookAt(beamEnd);
    outerBeamRef.current.rotateX(Math.PI / 2);
    outerBeamRef.current.scale.set(2.5, beamLength, 2.5);

    // Inner bright core
    innerBeamRef.current.position.copy(beamCenter);
    innerBeamRef.current.lookAt(beamEnd);
    innerBeamRef.current.rotateX(Math.PI / 2);
    innerBeamRef.current.scale.set(1.2, beamLength, 1.2);

    // Crackling energy layer with animated scale
    crackleBeamRef.current.position.copy(beamCenter);
    crackleBeamRef.current.lookAt(beamEnd);
    crackleBeamRef.current.rotateX(Math.PI / 2);
    const crackleScale = 1.8 + Math.sin(time * 12) * 0.3;
    crackleBeamRef.current.scale.set(crackleScale, beamLength, crackleScale);

    // Animated opacity for crackling effect
    const crackle = 0.3 + Math.sin(time * 15) * 0.2 + Math.sin(time * 23) * 0.15;
    crackleBeamMaterial.opacity = crackle * intensity;
    
    // Pulsing outer beam
    const pulse = 0.3 + Math.sin(time * 8) * 0.1;
    outerBeamMaterial.opacity = pulse * intensity;
    
    // Steady inner core
    innerBeamMaterial.opacity = 0.7 * intensity;

    // Glow light
    glowRef.current.position.copy(beamCenter);
    glowRef.current.intensity = 4 * intensity;
  });

  return (
    <>
      {/* Thick outer beam */}
      <mesh ref={outerBeamRef} material={outerBeamMaterial}>
        <cylinderGeometry args={[1, 1, 1, 32, 1, true]} />
      </mesh>

      {/* Bright inner core */}
      <mesh ref={innerBeamRef} material={innerBeamMaterial}>
        <cylinderGeometry args={[1, 1, 1, 32, 1, true]} />
      </mesh>

      {/* Crackling energy layer */}
      <mesh ref={crackleBeamRef} material={crackleBeamMaterial}>
        <cylinderGeometry args={[1, 1, 1, 32, 1, true]} />
      </mesh>

      {/* Focused glow */}
      <pointLight ref={glowRef} color="#aaccff" distance={12} />
    </>
  );
}
