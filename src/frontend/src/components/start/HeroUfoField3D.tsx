import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { heroDynamicsBus } from './heroDynamicsBus';

interface UfoData {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  phase: number;
  speed: number;
  pathRadius: number;
  nextDartTime: number;
  isDarting: boolean;
  dartStartTime: number;
  dartDuration: number;
  dartDirection: THREE.Vector3;
}

export function HeroUfoField3D() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Load obsidian UFO PBR textures
  const [obsidianBaseColor, obsidianRoughness, neonRingsEmissive] = useLoader(THREE.TextureLoader, [
    '/assets/generated/ufo-obsidian-basecolor.dim_4096x4096.png',
    '/assets/generated/ufo-obsidian-roughness.dim_4096x4096.png',
    '/assets/generated/ufo-neon-rings-emissive.dim_2048x2048.png',
  ]);

  // Obsidian-metal UFO material with razor-edge reflections
  const ufoMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: obsidianBaseColor,
      roughnessMap: obsidianRoughness,
      emissiveMap: neonRingsEmissive,
      emissive: new THREE.Color('#00ffff'),
      emissiveIntensity: 1.5,
      metalness: 0.95,
      roughness: 0.05,
      envMapIntensity: 3.0,
    });
  }, [obsidianBaseColor, obsidianRoughness, neonRingsEmissive]);

  // Only 2 background UFOs
  const ufos = useRef<UfoData[]>([
    {
      position: new THREE.Vector3(12, 6, -6),
      velocity: new THREE.Vector3(-0.8, 0.5, 0),
      phase: 0,
      speed: 0.35,
      pathRadius: 5,
      nextDartTime: 2,
      isDarting: false,
      dartStartTime: 0,
      dartDuration: 0.8,
      dartDirection: new THREE.Vector3(),
    },
    {
      position: new THREE.Vector3(-14, -5, -7),
      velocity: new THREE.Vector3(0.7, 0.3, -0.5),
      phase: Math.PI,
      speed: 0.4,
      pathRadius: 6,
      nextDartTime: 3.5,
      isDarting: false,
      dartStartTime: 0,
      dartDuration: 0.8,
      dartDirection: new THREE.Vector3(),
    },
  ]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    groupRef.current.children.forEach((ufoGroup, i) => {
      if (!(ufoGroup instanceof THREE.Group)) return;
      const ufo = ufos.current[i];
      if (!ufo) return;

      // === DART/PASS BEHAVIOR ===
      if (!ufo.isDarting && time >= ufo.nextDartTime) {
        // Start dart
        ufo.isDarting = true;
        ufo.dartStartTime = time;
        ufo.dartDirection = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ).normalize();
        ufo.nextDartTime = time + 3 + Math.random() * 4;
      }

      if (ufo.isDarting) {
        const dartAge = time - ufo.dartStartTime;
        if (dartAge >= ufo.dartDuration) {
          ufo.isDarting = false;
        } else {
          // Fast dart motion
          const dartSpeed = 15;
          ufo.position.add(ufo.dartDirection.clone().multiplyScalar(dartSpeed * 0.016));
        }
      } else {
        // Normal figure-8 flight
        const phase = time * ufo.speed + ufo.phase;
        ufo.position.x = 12 * Math.cos(phase);
        ufo.position.y = 6 * Math.sin(phase * 0.7) + (i === 0 ? 6 : -5);
        ufo.position.z = -6 + Math.sin(phase * 0.5) * 4;
      }

      ufoGroup.position.copy(ufo.position);

      // Continuous rotation
      ufoGroup.rotation.y += 0.015;
      ufoGroup.rotation.x = Math.sin(time * 1.2 + i) * 0.2;
      ufoGroup.rotation.z = Math.cos(time * 0.9 + i) * 0.15;

      // Update rim light colors
      const rimLights = ufoGroup.children.slice(2, 10);
      rimLights.forEach((light, j) => {
        if (light instanceof THREE.Mesh && light.material instanceof THREE.MeshStandardMaterial) {
          const shimmerPhase = time * 2 + j * 0.5 + i;
          const cyanMagenta = Math.sin(shimmerPhase) * 0.5 + 0.5;
          const color = new THREE.Color().setHSL(cyanMagenta * 0.25 + 0.5, 1.0, 0.5);
          light.material.color.copy(color);
          light.material.emissive.copy(color);
          light.material.emissiveIntensity = 2.5 + Math.sin(shimmerPhase * 3) * 0.5;
        }
      });

      // === WHITE SPOTLIGHTS ===
      const frontLight = ufoGroup.children.find(c => c.userData.isFrontLight) as THREE.SpotLight;
      const undersideLight = ufoGroup.children.find(c => c.userData.isUndersideLight) as THREE.SpotLight;

      if (frontLight && undersideLight) {
        // Aim at nearest cow
        const cows = heroDynamicsBus.getAllCows();
        if (cows.length > 0) {
          const nearestCow = cows.reduce((nearest, cow) => {
            const dist = ufo.position.distanceTo(cow.position);
            return dist < nearest.dist ? { dist, cow } : nearest;
          }, { dist: Infinity, cow: cows[0] });

          frontLight.target.position.copy(nearestCow.cow.position);
          undersideLight.target.position.copy(nearestCow.cow.position);
        }
      }

      // Publish UFO state to bus
      heroDynamicsBus.updateUfo(i + 1, {
        position: ufo.position.clone(),
        velocity: ufo.isDarting 
          ? ufo.dartDirection.clone().multiplyScalar(15)
          : new THREE.Vector3(
              Math.cos(time * ufo.speed + ufo.phase) * ufo.speed,
              Math.sin((time * ufo.speed + ufo.phase) * 0.7) * ufo.speed,
              Math.sin((time * ufo.speed + ufo.phase) * 0.5) * ufo.speed
            ),
        isDarting: ufo.isDarting,
      });
    });
  });

  return (
    <group ref={groupRef}>
      {ufos.current.map((ufo, i) => (
        <group key={i}>
          <mesh castShadow material={ufoMaterial}>
            <sphereGeometry args={[1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          
          <mesh castShadow material={ufoMaterial} position={[0, -0.3, 0]}>
            <cylinderGeometry args={[2, 1.2, 0.6, 32]} />
          </mesh>

          {/* Rim lights */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((j) => {
            const angle = (j / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 1.8;
            const z = Math.sin(angle) * 1.8;
            return (
              <mesh key={j} position={[x, -0.3, z]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial
                  color="#00ffff"
                  emissive="#00ffff"
                  emissiveIntensity={3}
                  metalness={1}
                  roughness={0}
                />
              </mesh>
            );
          })}

          {/* White front spotlight */}
          <spotLight
            userData={{ isFrontLight: true }}
            position={[0, 0, 2]}
            angle={Math.PI / 6}
            penumbra={0.3}
            intensity={8}
            distance={15}
            color="#ffffff"
            castShadow
          >
            <primitive object={new THREE.Object3D()} />
          </spotLight>

          {/* White underside spotlight */}
          <spotLight
            userData={{ isUndersideLight: true }}
            position={[0, -1.5, 0]}
            angle={Math.PI / 5}
            penumbra={0.4}
            intensity={10}
            distance={12}
            color="#ffffff"
            castShadow
          >
            <primitive object={new THREE.Object3D()} />
          </spotLight>
        </group>
      ))}
    </group>
  );
}
