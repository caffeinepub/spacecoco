import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

interface HeroFlyingCowPBRProps {
  position: [number, number, number];
  speed?: number;
  pathRadius?: number;
  index?: number;
}

export function HeroFlyingCowPBR({ 
  position, 
  speed = 0.3,
  pathRadius = 4,
  index = 0
}: HeroFlyingCowPBRProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  
  // Load candy-latex PBR textures
  const [candyBaseColor, candyRoughness] = useLoader(THREE.TextureLoader, [
    '/assets/generated/cow-candy-latex-basecolor.dim_4096x4096.png',
    '/assets/generated/cow-candy-latex-roughness.dim_4096x4096.png',
  ]);

  // Balloon-latex candy shell material with sugar sparkle
  const cowMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      map: candyBaseColor,
      roughnessMap: candyRoughness,
      roughness: 0.12,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      envMapIntensity: 2.8,
      reflectivity: 1.0,
      sheen: 0.5,
      sheenRoughness: 0.3,
      sheenColor: new THREE.Color('#ffffff'),
    });
  }, [candyBaseColor, candyRoughness]);

  const eyeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.2,
      metalness: 0.1,
    });
  }, []);

  const pupilMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#000000',
      roughness: 0.3,
      metalness: 0.0,
    });
  }, []);

  const initialPhase = useMemo(() => Math.random() * Math.PI * 2, []);
  const bankDirection = useMemo(() => (Math.random() > 0.5 ? 1 : -1), []);

  useFrame((state) => {
    if (!groupRef.current || !bodyRef.current || !headRef.current) return;

    const time = state.clock.elapsedTime * speed;
    const phase = time + initialPhase;

    // Get abduction intensity from userData
    const abductionIntensity = groupRef.current.userData.abductionIntensity || 0;

    // Get reaction state from userData
    const reactionStartTime = groupRef.current.userData.reactionStartTime || 0;
    const reactionAge = state.clock.elapsedTime - reactionStartTime;
    const reactionActive = reactionAge < 1.0 && reactionAge > 0;
    const reactionProgress = reactionActive ? reactionAge : 0;
    const reactionIntensity = reactionActive ? Math.sin(reactionProgress * Math.PI) : 0;

    // Inflation during abduction (~10% scale increase)
    const inflationScale = 1.0 + abductionIntensity * 0.1;
    if (bodyRef.current) {
      bodyRef.current.scale.set(inflationScale, inflationScale, inflationScale);
    }

    // === LAYERED REACTION ANIMATION ===
    // Wobble/roll exaggeration
    const reactionWobble = reactionIntensity * Math.sin(reactionProgress * 20) * 0.4;
    const reactionRoll = reactionIntensity * Math.cos(reactionProgress * 15) * 0.3;

    // Banking into turns (roll based on velocity direction change)
    const velocityAngle = Math.atan2(Math.cos(phase), -Math.sin(phase));
    const bankAngle = Math.sin(phase * 2) * 0.3 * bankDirection + reactionRoll;
    groupRef.current.rotation.z = bankAngle;
    groupRef.current.rotation.y = velocityAngle;

    // Body tilt (pitch) with reaction exaggeration
    const pitchAngle = Math.sin(time * 1.5) * 0.15 + reactionWobble;
    bodyRef.current.rotation.x = pitchAngle;

    // Head/neck secondary motion with reaction
    const headBob = Math.sin(time * 2.5 + 0.5) * 0.2 + reactionIntensity * 0.3;
    headRef.current.position.y = 0.2 + headBob;
    headRef.current.rotation.x = pitchAngle * 0.5 + Math.sin(time * 3) * 0.1 + reactionWobble * 0.5;

    // Tail flick during reaction
    if (tailRef.current) {
      const tailFlick = reactionIntensity * Math.sin(reactionProgress * 30) * 0.8;
      tailRef.current.rotation.z = Math.PI / 4 + tailFlick;
      tailRef.current.rotation.y = reactionIntensity * Math.cos(reactionProgress * 25) * 0.5;
    }

    // Pupil spin during abduction
    const pupilSpinSpeed = abductionIntensity > 0.3 ? 8 : 2;
    if (leftPupilRef.current && rightPupilRef.current) {
      leftPupilRef.current.rotation.z = time * pupilSpinSpeed;
      rightPupilRef.current.rotation.z = time * pupilSpinSpeed;
    }

    // Leg/hoof motion with reaction pedaling
    const legSpeedMultiplier = 1 + reactionIntensity * 3;
    groupRef.current.children.forEach((child, i) => {
      if (i >= 5 && i <= 8) { // Legs
        const legPhase = time * 4 * legSpeedMultiplier + i * Math.PI / 2;
        child.rotation.x = Math.sin(legPhase) * 0.3;
      }
    });

    // Squash/stretch during reaction
    if (reactionActive && bodyRef.current) {
      const squash = 1 - reactionIntensity * 0.15;
      const stretch = 1 + reactionIntensity * 0.15;
      bodyRef.current.scale.set(
        inflationScale * stretch,
        inflationScale * squash,
        inflationScale * stretch
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh ref={bodyRef} castShadow receiveShadow material={cowMaterial}>
        <boxGeometry args={[2, 1.2, 1.5]} />
      </mesh>
      
      {/* Head */}
      <mesh ref={headRef} position={[1.2, 0.2, 0]} castShadow receiveShadow material={cowMaterial}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
      </mesh>

      {/* Eyes with painted look */}
      <mesh ref={leftEyeRef} position={[1.5, 0.3, 0.25]} castShadow material={eyeMaterial}>
        <sphereGeometry args={[0.15, 16, 16]} />
      </mesh>
      <mesh ref={rightEyeRef} position={[1.5, 0.3, -0.25]} castShadow material={eyeMaterial}>
        <sphereGeometry args={[0.15, 16, 16]} />
      </mesh>

      {/* Pupils that spin during abduction */}
      <mesh ref={leftPupilRef} position={[1.58, 0.3, 0.25]} rotation={[0, 0, Math.PI / 2]} castShadow material={pupilMaterial}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
      </mesh>
      <mesh ref={rightPupilRef} position={[1.58, 0.3, -0.25]} rotation={[0, 0, Math.PI / 2]} castShadow material={pupilMaterial}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.5, -0.8, 0.5]} castShadow material={cowMaterial}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
      </mesh>
      <mesh position={[-0.5, -0.8, -0.5]} castShadow material={cowMaterial}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
      </mesh>
      <mesh position={[0.5, -0.8, 0.5]} castShadow material={cowMaterial}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
      </mesh>
      <mesh position={[0.5, -0.8, -0.5]} castShadow material={cowMaterial}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
      </mesh>

      {/* Tail */}
      <mesh ref={tailRef} position={[-1.1, 0.2, 0]} rotation={[0, 0, Math.PI / 4]} castShadow material={cowMaterial}>
        <cylinderGeometry args={[0.08, 0.05, 0.6, 16]} />
      </mesh>
    </group>
  );
}
