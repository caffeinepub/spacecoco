import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { NeonSpaceStars } from './NeonSpaceStars';
import { PixelCloudField } from './PixelCloudField';
import { FlyingCowPBR } from './FlyingCowPBR';
import { StarExplosionField } from './StarExplosionField';
import { UfoField3D } from './UfoField3D';
import { MeteorConfettiField } from './MeteorConfettiField';
import { PenguinShotField } from './PenguinShotField';
import { useDocumentVisibility } from '@/hooks/useDocumentVisibility';
import { useNeonHueCycle } from './useNeonHueCycle';

function SceneContent() {
  const isVisible = useDocumentVisibility();
  const starPositionsRef = useRef<THREE.Vector3[]>([]);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const directionalLight1Ref = useRef<THREE.DirectionalLight>(null);
  const directionalLight2Ref = useRef<THREE.DirectionalLight>(null);
  const fogRef = useRef<THREE.Fog>(null);
  const elapsedTimeRef = useRef(0);

  const cowPositions = useMemo(() => [
    [-15, 5, -8] as [number, number, number],
    [10, -3, -12] as [number, number, number],
    [-5, 8, -15] as [number, number, number],
    [20, 2, -10] as [number, number, number],
    [-20, -5, -18] as [number, number, number],
  ], []);

  // Call hook at top level
  const hueColor = useNeonHueCycle(elapsedTimeRef.current);

  useFrame((state) => {
    elapsedTimeRef.current = state.clock.elapsedTime;

    // Apply hue cycling to scene elements
    if (ambientLightRef.current) {
      ambientLightRef.current.color.copy(hueColor);
    }
    if (directionalLight1Ref.current) {
      directionalLight1Ref.current.color.copy(hueColor);
    }
    if (directionalLight2Ref.current) {
      const complementary = hueColor.clone();
      complementary.offsetHSL(0.5, 0, 0);
      directionalLight2Ref.current.color.copy(complementary);
    }
    if (fogRef.current) {
      fogRef.current.color.copy(hueColor).multiplyScalar(0.2);
    }
  });

  return (
    <>
      {/* Environment lighting with neon space HDRI */}
      <Suspense fallback={null}>
        <Environment
          files="/assets/generated/neon-space-env.dim_2048x1024.png"
          background={false}
        />
      </Suspense>

      {/* Neon key lights with hue cycling */}
      <ambientLight ref={ambientLightRef} intensity={0.5} color="#4400ff" />
      <directionalLight
        ref={directionalLight1Ref}
        position={[10, 10, 5]}
        intensity={1.8}
        color="#00ffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <directionalLight
        ref={directionalLight2Ref}
        position={[-10, 5, -5]}
        intensity={1.5}
        color="#ff00ff"
      />
      <pointLight position={[0, 0, 10]} intensity={2.5} color="#00ff88" distance={40} />

      {/* Fog with hue cycling */}
      <fog ref={fogRef} attach="fog" args={['#000510', 20, 60]} />

      {/* Twinkling stars with explosion field */}
      {isVisible && (
        <>
          <NeonSpaceStars count={250} onPositionsUpdate={(positions) => {
            starPositionsRef.current = positions;
          }} />
          <StarExplosionField starPositions={starPositionsRef.current} />
        </>
      )}

      {/* Pixel clouds (faster) */}
      <Suspense fallback={null}>
        <PixelCloudField speedMultiplier={3} />
      </Suspense>

      {/* Flying cows with PBR and trails */}
      <Suspense fallback={null}>
        {cowPositions.map((pos, i) => (
          <FlyingCowPBR
            key={i}
            position={pos}
            scale={0.8 + Math.random() * 0.4}
            speed={0.3 + Math.random() * 0.4}
            pathRadius={4 + Math.random() * 3}
          />
        ))}
      </Suspense>

      {/* UFOs with disco glints */}
      <Suspense fallback={null}>
        <UfoField3D />
      </Suspense>

      {/* Meteors with confetti */}
      <Suspense fallback={null}>
        <MeteorConfettiField />
      </Suspense>

      {/* Penguin shots with pink smoke */}
      <Suspense fallback={null}>
        <PenguinShotField />
      </Suspense>

      {/* Shadow plane (invisible) */}
      <mesh receiveShadow position={[0, -10, -15]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </>
  );
}

export function NeonSpaceBackground3D() {
  const isVisible = useDocumentVisibility();

  return (
    <Canvas
      camera={{ position: [0, 0, 20], fov: 60 }}
      dpr={Math.min(window.devicePixelRatio, 2)}
      shadows
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      frameloop={isVisible ? 'always' : 'demand'}
      style={{ background: 'transparent' }}
    >
      <color attach="background" args={['#000510']} />
      <SceneContent />
    </Canvas>
  );
}
