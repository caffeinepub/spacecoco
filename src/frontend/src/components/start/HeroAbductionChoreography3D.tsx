import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { HeroFlyingCowPBR } from './HeroFlyingCowPBR';
import { HeroAbductionBeamVfx } from './HeroAbductionBeamVfx';
import { heroDynamicsBus } from './heroDynamicsBus';

interface AbductionState {
  ufoIndex: number;
  targetCowIndex: number;
  startTime: number;
  liftProgress: number;
  beamIntensity: number;
}

interface CowState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  reactionTimer: number;
}

export function HeroAbductionChoreography3D() {
  const ufoGroupRefs = useRef<(THREE.Group | null)[]>([null]);
  const cowRefs = useRef<(THREE.Group | null)[]>([null, null, null, null, null, null]);
  
  const cowStates = useRef<CowState[]>([]);
  const reactionScheduler = useRef<number>(0);
  
  const cowInitialPositions = useMemo(() => [
    new THREE.Vector3(-8, 2, 0),
    new THREE.Vector3(0, -2, -2),
    new THREE.Vector3(8, 1, -1),
    new THREE.Vector3(-4, -4, -3),
    new THREE.Vector3(4, 3, -2),
    new THREE.Vector3(0, 5, -4),
  ], []);

  // Initialize cow states with random velocities
  if (cowStates.current.length === 0) {
    cowStates.current = cowInitialPositions.map((pos) => ({
      position: pos.clone(),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.4
      ),
      reactionTimer: Math.random() * 3,
    }));
  }

  const activeAbductions = useRef<AbductionState[]>([]);
  const nextAbductionTime = useRef(0);

  // Load obsidian UFO textures
  const [obsidianBaseColor, obsidianRoughness, neonRingsEmissive] = useLoader(THREE.TextureLoader, [
    '/assets/generated/ufo-obsidian-basecolor.dim_4096x4096.png',
    '/assets/generated/ufo-obsidian-roughness.dim_4096x4096.png',
    '/assets/generated/ufo-neon-rings-emissive.dim_2048x2048.png',
  ]);

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

  const ufoPositions = useMemo(() => [
    new THREE.Vector3(-10, 8, -4),
  ], []);

  // Visible bounds for cow movement
  const bounds = useMemo(() => ({
    minX: -12,
    maxX: 12,
    minY: -6,
    maxY: 8,
    minZ: -8,
    maxZ: 2,
  }), []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    heroDynamicsBus.setTimestamp(time);

    // === COW SMOOTH MOVEMENT WITH SEPARATION STEERING ===
    const separationRadius = 2.5;
    const separationStrength = 0.8;
    const maxSpeed = 0.6;
    const damping = 0.98;

    cowStates.current.forEach((cowState, i) => {
      const cowRef = cowRefs.current[i];
      if (!cowRef) return;

      // Apply separation steering (avoid other cows)
      const separationForce = new THREE.Vector3();
      cowStates.current.forEach((otherCow, j) => {
        if (i === j) return;
        const diff = cowState.position.clone().sub(otherCow.position);
        const dist = diff.length();
        if (dist < separationRadius && dist > 0.01) {
          diff.normalize().multiplyScalar(separationStrength / dist);
          separationForce.add(diff);
        }
      });

      // Apply separation force to velocity
      cowState.velocity.add(separationForce.multiplyScalar(delta));

      // Clamp velocity
      const speed = cowState.velocity.length();
      if (speed > maxSpeed) {
        cowState.velocity.normalize().multiplyScalar(maxSpeed);
      }

      // Apply damping
      cowState.velocity.multiplyScalar(damping);

      // Update position
      cowState.position.add(cowState.velocity.clone().multiplyScalar(delta * 60));

      // Wrap/clamp within bounds
      if (cowState.position.x < bounds.minX) cowState.position.x = bounds.maxX;
      if (cowState.position.x > bounds.maxX) cowState.position.x = bounds.minX;
      if (cowState.position.y < bounds.minY) cowState.position.y = bounds.maxY;
      if (cowState.position.y > bounds.maxY) cowState.position.y = bounds.minY;
      if (cowState.position.z < bounds.minZ) cowState.position.z = bounds.maxZ;
      if (cowState.position.z > bounds.maxZ) cowState.position.z = bounds.minZ;

      // Update cow ref position
      cowRef.position.copy(cowState.position);

      // Publish to bus
      heroDynamicsBus.updateCow(i, {
        position: cowState.position.clone(),
        velocity: cowState.velocity.clone(),
        reactionStartTime: cowRef.userData.reactionStartTime || 0,
        reactionIntensity: cowRef.userData.reactionIntensity || 0,
      });
    });

    // === UFO IMPULSE PUSHES ===
    const ufos = heroDynamicsBus.getAllUfos();
    const impulseRadius = 3.0;
    const impulseStrength = 2.5;

    ufos.forEach((ufo) => {
      if (!ufo.isDarting) return;

      cowStates.current.forEach((cowState, i) => {
        const diff = cowState.position.clone().sub(ufo.position);
        const dist = diff.length();
        
        if (dist < impulseRadius && dist > 0.01) {
          // Apply impulse push
          const impulse = diff.normalize().multiplyScalar(impulseStrength);
          cowState.velocity.add(impulse);
        }
      });
    });

    // === 3-SECOND REACTION CADENCE ===
    reactionScheduler.current += delta;
    if (reactionScheduler.current >= 3.0) {
      reactionScheduler.current = 0;
      
      // Trigger reaction on random cow
      const randomCowIndex = Math.floor(Math.random() * cowRefs.current.length);
      const cowRef = cowRefs.current[randomCowIndex];
      if (cowRef) {
        cowRef.userData.reactionStartTime = time;
        cowRef.userData.reactionIntensity = 1.0;
      }
    }

    // === SPAWN NEW ABDUCTIONS ===
    if (time >= nextAbductionTime.current && activeAbductions.current.length < 2) {
      const availableCows = cowInitialPositions
        .map((_, i) => i)
        .filter(i => !activeAbductions.current.some(a => a.targetCowIndex === i));
      
      if (availableCows.length > 0) {
        const targetCowIndex = availableCows[Math.floor(Math.random() * availableCows.length)];
        activeAbductions.current.push({
          ufoIndex: 0,
          targetCowIndex,
          startTime: time,
          liftProgress: 0,
          beamIntensity: 0,
        });
        nextAbductionTime.current = time + 2.5 + Math.random() * 2;
      }
    }

    // === UPDATE ACTIVE ABDUCTIONS ===
    activeAbductions.current = activeAbductions.current.filter(abduction => {
      const elapsed = time - abduction.startTime;
      const ABDUCTION_DURATION = 4.0;
      
      if (elapsed >= ABDUCTION_DURATION) {
        const cowRef = cowRefs.current[abduction.targetCowIndex];
        if (cowRef) {
          cowRef.userData.abductionIntensity = 0;
        }
        return false;
      }

      // Beam ramp up
      if (elapsed < 0.5) {
        abduction.beamIntensity = elapsed / 0.5;
      } else if (elapsed > ABDUCTION_DURATION - 0.8) {
        abduction.beamIntensity = (ABDUCTION_DURATION - elapsed) / 0.8;
      } else {
        abduction.beamIntensity = 1.0;
      }

      // Slow lift
      if (elapsed > 0.5 && elapsed < ABDUCTION_DURATION - 0.8) {
        const liftTime = elapsed - 0.5;
        abduction.liftProgress = liftTime * 0.015;
      } else if (elapsed >= ABDUCTION_DURATION - 0.8) {
        const releaseProgress = (elapsed - (ABDUCTION_DURATION - 0.8)) / 0.8;
        const bounce = Math.sin(releaseProgress * Math.PI * 2) * 0.3 * (1 - releaseProgress);
        abduction.liftProgress = Math.max(0, abduction.liftProgress * (1 - releaseProgress) + bounce);
      }

      // Update cow position and abduction intensity
      const cowRef = cowRefs.current[abduction.targetCowIndex];
      if (cowRef) {
        cowRef.position.y = cowStates.current[abduction.targetCowIndex].position.y + abduction.liftProgress;
        cowRef.userData.abductionIntensity = abduction.beamIntensity;
      }

      return true;
    });

    // === ANIMATE UFO ===
    const ufoGroup = ufoGroupRefs.current[0];
    if (ufoGroup) {
      const driftPhase = time * 0.3;
      const spiralPhase = time * 0.5;
      
      ufoGroup.position.x = ufoPositions[0].x + Math.cos(driftPhase) * 3;
      ufoGroup.position.y = ufoPositions[0].y + Math.sin(driftPhase * 0.7) * 2;
      ufoGroup.position.z = ufoPositions[0].z + Math.sin(spiralPhase) * 2;
      
      ufoGroup.rotation.y += 0.01;
      ufoGroup.rotation.x = Math.sin(time * 1.5) * 0.15;
      ufoGroup.rotation.z = Math.cos(time * 1.2) * 0.1;

      // Update rim light colors
      const rimLights = ufoGroup.children.slice(2, 10);
      rimLights.forEach((light, j) => {
        if (light instanceof THREE.Mesh && light.material instanceof THREE.MeshStandardMaterial) {
          const shimmerPhase = time * 2 + j * 0.5;
          const cyanMagenta = Math.sin(shimmerPhase) * 0.5 + 0.5;
          const color = new THREE.Color().setHSL(cyanMagenta * 0.25 + 0.5, 1.0, 0.5);
          light.material.color.copy(color);
          light.material.emissive.copy(color);
          light.material.emissiveIntensity = 2.5 + Math.sin(shimmerPhase * 3) * 0.5;
        }
      });

      // Add white spotlights (front + underside)
      const frontLight = ufoGroup.children.find(c => c.userData.isFrontLight) as THREE.SpotLight;
      const undersideLight = ufoGroup.children.find(c => c.userData.isUndersideLight) as THREE.SpotLight;

      if (frontLight && undersideLight) {
        // Aim at nearest cow
        const nearestCow = cowStates.current.reduce((nearest, cow, i) => {
          const dist = ufoGroup.position.distanceTo(cow.position);
          return dist < nearest.dist ? { dist, index: i } : nearest;
        }, { dist: Infinity, index: 0 });

        const targetCow = cowStates.current[nearestCow.index];
        if (targetCow) {
          frontLight.target.position.copy(targetCow.position);
          undersideLight.target.position.copy(targetCow.position);
        }
      }

      // Publish UFO state to bus
      heroDynamicsBus.updateUfo(0, {
        position: ufoGroup.position.clone(),
        velocity: new THREE.Vector3(
          Math.cos(driftPhase) * 0.3,
          Math.sin(driftPhase * 0.7) * 0.2,
          Math.sin(spiralPhase) * 0.2
        ),
        isDarting: false,
      });
    }
  });

  return (
    <>
      {/* Single choreographed UFO with white spotlights */}
      <group ref={(el) => (ufoGroupRefs.current[0] = el)}>
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

      {/* Multiple abduction beams */}
      {activeAbductions.current.map((abduction, i) => {
        const ufoGroup = ufoGroupRefs.current[abduction.ufoIndex];
        if (!ufoGroup) return null;
        
        return (
          <HeroAbductionBeamVfx
            key={`beam-${i}`}
            ufoPosition={ufoGroup.position}
            targetPosition={cowStates.current[abduction.targetCowIndex].position}
            intensity={abduction.beamIntensity}
          />
        );
      })}

      {/* 6 Cows with refs */}
      {cowInitialPositions.map((pos, i) => (
        <group key={i} ref={(el) => (cowRefs.current[i] = el)}>
          <HeroFlyingCowPBR 
            position={[pos.x, pos.y, pos.z]} 
            speed={0.3} 
            pathRadius={0} 
            index={i}
          />
        </group>
      ))}
    </>
  );
}
