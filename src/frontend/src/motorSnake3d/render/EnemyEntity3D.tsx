import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Enemy } from '../state/gameState';
import { NEON_COLORS } from './neonStyle';
import { ENEMY_MODEL_CATALOG } from './enemyModelCatalog';
import { 
  applyUfoMaterial, 
  applyCowMaterial, 
  applyCrocodileMaterial, 
  applyPenguinMaterial,
  findEmissiveParts,
  findBoneByName
} from './enemyModelRigging';

interface ModelData {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
}

interface EnemyEntity3DProps {
  enemy: Enemy;
  loadedModels: Map<string, ModelData>;
}

export function EnemyEntity3D({ enemy, loadedModels }: EnemyEntity3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const hoverOffset = useRef(Math.random() * Math.PI * 2);
  const emissivePartsRef = useRef<THREE.Mesh[]>([]);
  const tailBoneRef = useRef<THREE.Bone | null>(null);

  // Clone and setup model
  const modelScene = useMemo(() => {
    const config = ENEMY_MODEL_CATALOG[enemy.type];
    if (!config) return null;

    const modelData = loadedModels.get(config.path);
    if (!modelData) return null;

    const clonedScene = modelData.scene.clone();
    
    // Apply type-specific materials
    switch (enemy.type) {
      case 'ufo':
        applyUfoMaterial(clonedScene);
        emissivePartsRef.current = findEmissiveParts(clonedScene);
        break;
      case 'cow':
        applyCowMaterial(clonedScene);
        tailBoneRef.current = findBoneByName(clonedScene, 'tail');
        break;
      case 'crocodile':
        applyCrocodileMaterial(clonedScene);
        break;
      case 'penguin':
        applyPenguinMaterial(clonedScene);
        break;
    }

    // Ensure all meshes cast and receive shadows
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Ensure material responds to lighting
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.needsUpdate = true;
        }
      }
    });

    // Setup animation mixer if animations exist
    if (modelData.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(clonedScene);
      mixerRef.current = mixer;
      
      // Play first animation (idle/walk)
      const action = mixer.clipAction(modelData.animations[0]);
      action.play();
    }

    return clonedScene;
  }, [enemy.type, loadedModels]);

  useEffect(() => {
    if (modelScene && groupRef.current) {
      modelRef.current = modelScene;
      groupRef.current.add(modelScene);

      return () => {
        if (groupRef.current && modelScene) {
          groupRef.current.remove(modelScene);
        }
      };
    }
  }, [modelScene]);

  useFrame((state, delta) => {
    if (!groupRef.current || !modelRef.current) return;
    
    const time = state.clock.elapsedTime;
    const config = ENEMY_MODEL_CATALOG[enemy.type];
    
    // Position
    groupRef.current.position.copy(enemy.position);
    if (config) {
      groupRef.current.position.add(config.positionOffset);
    }
    
    // Scale
    if (config) {
      const baseScale = config.scale;
      groupRef.current.scale.setScalar(baseScale);
    }
    
    // Type-specific animations
    switch (enemy.type) {
      case 'ufo':
        // Hover and rotate
        groupRef.current.position.y += Math.sin(time * 2 + hoverOffset.current) * 0.3;
        modelRef.current.rotation.y += delta * 0.5;
        
        // Blinking emissive lights
        const blinkPhase = Math.sin(time * 4) * 0.5 + 0.5;
        emissivePartsRef.current.forEach((part) => {
          const material = part.material as THREE.MeshStandardMaterial;
          material.emissiveIntensity = 1.5 + blinkPhase * 1.5;
        });
        break;
        
      case 'cow':
        // Hover animation
        groupRef.current.position.y += Math.sin(time * 2 + hoverOffset.current) * 0.5;
        
        // Tail swish animation (fallback if no bone animation)
        if (tailBoneRef.current && !mixerRef.current) {
          tailBoneRef.current.rotation.z = Math.sin(time * 3) * 0.3;
        }
        
        // Subtle rotation
        modelRef.current.rotation.y += delta * 0.2;
        break;
        
      case 'crocodile':
        // Subtle idle motion
        modelRef.current.rotation.y = Math.sin(time * 1.5) * 0.2;
        groupRef.current.position.y += Math.sin(time * 1.2) * 0.1;
        break;
        
      case 'penguin':
        // Idle walk when near-stationary
        const velocity = enemy.velocity.length();
        if (velocity < 0.5 && mixerRef.current) {
          mixerRef.current.timeScale = 0.5; // Slow walk
        } else if (mixerRef.current) {
          mixerRef.current.timeScale = 1.0;
        }
        
        // Waddle rotation
        modelRef.current.rotation.z = Math.sin(time * 2) * 0.1;
        break;
    }
    
    // Update animation mixer
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
    
    // Subtle idle rotation for all
    const idleRotation = Math.sin(time * 0.5) * 0.05;
    modelRef.current.rotation.y += idleRotation * delta;
  });

  // Fallback to primitive if model not loaded
  if (!modelScene) {
    return (
      <mesh ref={groupRef as any} position={enemy.position}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial
          color={NEON_COLORS.hotPink}
          emissive={NEON_COLORS.hotPink}
          emissiveIntensity={1.5}
        />
      </mesh>
    );
  }

  return <group ref={groupRef} />;
}
