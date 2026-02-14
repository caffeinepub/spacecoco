import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { NeonSpaceStars } from './NeonSpaceStars';
import { PixelCloudField } from './PixelCloudField';
import { FlyingCowPBR } from './FlyingCowPBR';
import { useDocumentVisibility } from '@/hooks/useDocumentVisibility';

function SceneContent() {
  const isVisible = useDocumentVisibility();

  const cowPositions = useMemo(() => [
    [-15, 5, -8] as [number, number, number],
    [10, -3, -12] as [number, number, number],
    [-5, 8, -15] as [number, number, number],
    [20, 2, -10] as [number, number, number],
    [-20, -5, -18] as [number, number, number],
  ], []);

  return (
    <>
      {/* Environment lighting with neon space HDRI */}
      <Suspense fallback={null}>
        <Environment
          files="/assets/generated/neon-space-env.dim_2048x1024.png"
          background={false}
        />
      </Suspense>

      {/* Neon key lights */}
      <ambientLight intensity={0.3} color="#4400ff" />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
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
        position={[-10, 5, -5]}
        intensity={1.2}
        color="#ff00ff"
      />
      <pointLight position={[0, 0, 10]} intensity={2} color="#00ff88" distance={40} />

      {/* Twinkling stars */}
      {isVisible && <NeonSpaceStars count={250} />}

      {/* Pixel clouds */}
      <Suspense fallback={null}>
        <PixelCloudField />
      </Suspense>

      {/* Flying cows with PBR */}
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
      <fog attach="fog" args={['#000510', 20, 60]} />
      <SceneContent />
    </Canvas>
  );
}
