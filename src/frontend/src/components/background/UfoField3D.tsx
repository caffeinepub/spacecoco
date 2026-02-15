import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { getCyclingAccentColor } from '../start/ufoAccentPalette';

interface Glint {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  startTime: number;
  lifetime: number;
}

export function UfoField3D() {
  const groupRef = useRef<THREE.Group>(null);
  const glintsRef = useRef<Glint[]>([]);
  const glintMeshesRef = useRef<THREE.Mesh[]>([]);
  const lastGlintTime = useRef(0);

  const ufoPositions = useMemo(() => [
    new THREE.Vector3(-10, 10, -5),
    new THREE.Vector3(15, -8, -10),
    new THREE.Vector3(-20, 5, -15),
  ], []);

  const glintGeometry = useMemo(() => new THREE.PlaneGeometry(0.5, 2), []);
  const glintMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  }), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const delta = state.clock.getDelta();

    // Rotate UFOs
    if (groupRef.current) {
      groupRef.current.children.slice(0, ufoPositions.length).forEach((ufoGroup, i) => {
        ufoGroup.rotation.y += delta * 2;
        
        // Update rim light colors
        const rimLights = ufoGroup.children.slice(2, 10);
        rimLights.forEach((light, j) => {
          if (light instanceof THREE.Mesh && light.material instanceof THREE.MeshStandardMaterial) {
            const color = getCyclingAccentColor(time, i * 8 + j, 0.3);
            light.material.color.set(color);
            light.material.emissive.set(color);
          }
        });
      });
    }

    // Spawn glints periodically
    if (time - lastGlintTime.current > 0.5) {
      const randomUfo = ufoPositions[Math.floor(Math.random() * ufoPositions.length)];
      const direction = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize();

      const glint: Glint = {
        id: `glint-${Date.now()}`,
        position: randomUfo.clone(),
        velocity: direction.multiplyScalar(20),
        startTime: time,
        lifetime: 1,
      };

      glintsRef.current.push(glint);
      lastGlintTime.current = time;

      // Create mesh
      const mesh = new THREE.Mesh(glintGeometry, glintMaterial.clone());
      mesh.position.copy(randomUfo);
      groupRef.current?.add(mesh);
      glintMeshesRef.current.push(mesh);
    }

    // Update glints
    glintsRef.current = glintsRef.current.filter((glint, index) => {
      const age = time - glint.startTime;
      const progress = age / glint.lifetime;

      if (progress >= 1) {
        const mesh = glintMeshesRef.current[index];
        if (mesh) {
          groupRef.current?.remove(mesh);
          mesh.geometry.dispose();
          if (mesh.material instanceof THREE.Material) {
            mesh.material.dispose();
          }
        }
        glintMeshesRef.current.splice(index, 1);
        return false;
      }

      // Update position
      glint.position.add(glint.velocity.clone().multiplyScalar(delta));

      const mesh = glintMeshesRef.current[index];
      if (mesh) {
        mesh.position.copy(glint.position);
        mesh.lookAt(state.camera.position);
        if (mesh.material instanceof THREE.MeshBasicMaterial) {
          mesh.material.opacity = 1 - progress;
        }
      }

      return true;
    });
  });

  return (
    <group ref={groupRef}>
      {ufoPositions.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh>
            <cylinderGeometry args={[2, 1, 0.5, 32]} />
            <meshStandardMaterial
              color="#4488ff"
              emissive="#4488ff"
              emissiveIntensity={2.0}
              metalness={0.95}
              roughness={0.1}
            />
          </mesh>

          {/* Rim lights with cycling colors */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((j) => {
            const angle = (j / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 1.5;
            const z = Math.sin(angle) * 1.5;
            return (
              <mesh key={j} position={[x, -0.25, z]}>
                <sphereGeometry args={[0.12, 16, 16]} />
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
        </group>
      ))}
    </group>
  );
}
