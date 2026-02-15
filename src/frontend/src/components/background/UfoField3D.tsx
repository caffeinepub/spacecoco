import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

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
      groupRef.current.children.slice(0, ufoPositions.length).forEach((ufo, i) => {
        ufo.rotation.y += delta * 2;
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
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[2, 1, 0.5, 32]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}
