import { Suspense, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { HeroAbductionChoreography3D } from './HeroAbductionChoreography3D';
import { HeroUfoField3D } from './HeroUfoField3D';
import { HeroCowEyeLaserVfx } from './HeroCowEyeLaserVfx';
import { heroDynamicsBus } from './heroDynamicsBus';
import * as THREE from 'three';

export function HomeHeroThreeOverlay() {
  const cowPositions = useMemo(() => [
    new THREE.Vector3(-8, 2, 0),
    new THREE.Vector3(0, -2, -2),
    new THREE.Vector3(8, 1, -1),
    new THREE.Vector3(-4, -4, -3),
    new THREE.Vector3(4, 3, -2),
    new THREE.Vector3(0, 5, -4),
  ], []);

  const ufoPosition = useMemo(() => new THREE.Vector3(0, 8, -5), []);

  // Clear bus on unmount
  useEffect(() => {
    return () => {
      heroDynamicsBus.clear();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        shadows
      >
        <Suspense fallback={null}>
          {/* Enhanced lighting for PBR materials and glossy surfaces */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, 5, 5]} intensity={1.2} color="#ff00ff" />
          <pointLight position={[10, -5, 5]} intensity={1.2} color="#00ffff" />
          <pointLight position={[0, 10, 10]} intensity={1.0} color="#ffffff" />

          {/* Shadow receiver plane (subtle, below cows) */}
          <mesh receiveShadow position={[0, -8, -5]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[50, 50]} />
            <shadowMaterial opacity={0.3} />
          </mesh>

          {/* Synchronized choreography with cows and abducting UFOs */}
          <HeroAbductionChoreography3D />

          {/* Additional background UFOs with metallic glossy look (now only 2 background UFOs) */}
          <HeroUfoField3D />

          {/* Eye laser VFX from cows to UFOs */}
          <HeroCowEyeLaserVfx cowPositions={cowPositions} ufoPosition={ufoPosition} />
        </Suspense>
      </Canvas>
    </div>
  );
}
